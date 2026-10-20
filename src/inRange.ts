export function inRange(rollDef: string | undefined, roll: number) {
    if (rollDef === undefined || !isFinite(roll)) {
        return false;
    }
    const [from, to = from]: number[] = rollDef.split(/[.][.]/).map(it => Number(it));
    return from <= roll && roll <= to;
}
