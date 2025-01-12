type RollResultTypes = 'SUCCESS' | 'CRITICAL_SUCCESS' | 'FAIL' | 'CRITICAL_FAIL';

export interface iRollResult {
    result: number;
    bonus: number;
    type: RollResultTypes;

    toString(): string;
}

export interface iMultipleRollResults {
    sequence: Array<iRollResult>;
    final: number; // index of the highest roll

    finalRoll(): iRollResult;
    sequenceToString(): string;
}

export class DNDice {
    /**
     * Base class for Dices, with a default of 1d20
     */
    public amount: number;
    public sides: number;

    constructor(amount: number = 1, sides: number = 20) {
        this.amount = amount;
        this.sides = sides;
    }

    public static fromObject(obj: { amount: number; sides: number }): DNDice {
        return new DNDice(obj.amount, obj.sides);
    }

    private rollOneTime(): number {
        return Math.floor(Math.random() * this.sides) + 1;
    }

    private _roll(mustRoll: number, bonus: number = 0): iRollResult {
        let total = bonus;
        for (let i = 0; i < this.amount; i++) {
            total += this.rollOneTime();
        }
        return {
            result: total,
            bonus,
            type: this.analyzeRoll(total, mustRoll, bonus),

            toString(): string {
                return `${this.result - this.bonus}+${bonus} [${this.type}]`;
            },
        };
    }

    private analyzeRoll(roll: number, mustRoll: number, bonus: number): RollResultTypes {
        const raw = roll - bonus;
        if (raw === this.sides) {
            return 'CRITICAL_SUCCESS';
        }
        if (raw === 1) {
            return 'CRITICAL_FAIL';
        }
        if (roll >= mustRoll) {
            return 'SUCCESS';
        }
        return 'FAIL';
    }

    public roll(mustRoll: number, timesToThrow: number = 1, bonus: number = 0): iMultipleRollResults {
        let total = 0; // index
        const sequence = [];
        for (let i = 0; i < timesToThrow; i++) {
            const roll = this._roll(mustRoll, bonus);
            sequence.push(roll);
            if (DNDice._secondRollHigher(roll, sequence[total])) {
                total = i;
            }
        }
        return {
            sequence,
            final: total,

            finalRoll(): iRollResult {
                return this.sequence[this.final];
            },
            sequenceToString(): string {
                return this.sequence.map((r) => r.toString()).join(', ');
            },
        };
    }

    private static _secondRollHigher(first: iRollResult, second: iRollResult): boolean {
        switch (first.type) {
            case 'CRITICAL_SUCCESS':
                return false; // critical success is always higher
            case 'CRITICAL_FAIL':
                if (second.type === 'CRITICAL_SUCCESS') {
                    return true;
                }
                return second.result > first.result - first.bonus;
            case 'SUCCESS':
            case 'FAIL':
                if (second.type === 'CRITICAL_SUCCESS') {
                    return true;
                }
                if (second.type === 'CRITICAL_FAIL') {
                    return first.result > second.result - second.bonus;
                }
                return second.result > first.result;
        }
    }
}

export const isDescriptor = (descriptor: unknown): boolean => {
    return (
        !!descriptor &&
        typeof descriptor === 'string' &&
        descriptor.length > 0 &&
        /^[a-zA-Z]+:[a-zA-Z._-]+$/gm.test(descriptor)
    );
};
