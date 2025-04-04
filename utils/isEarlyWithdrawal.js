
export const toDays = (variation, variable) => {
    switch (variation) {
        case 'months':
            return variable * 30;
        case 'weeks':
            return variable * 7;
        case 'days':
            return variable;
        default:
            return 0;
    }
}
export const isEarly = (currently_at, num_of_month, variants) => {
    const currentlyAtInDays = toDays(variants, currently_at);
    const numOfMonthInDays = toDays(variants, num_of_month);
    return currentlyAtInDays < numOfMonthInDays;
}