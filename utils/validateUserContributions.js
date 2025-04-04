export const validateUserContributions = (contributions, type) => {
    for (const contribution of contributions) {
        if (['closed', 'completed', 'stopped'].includes(contribution.status)) {
            continue;
        }

        if (contribution.type === type) {
            return true;
        }
    }

    return false;
};