
export function validateConfig(selectors) {
    if (
        selectors === null ||
        typeof selectors !== 'object' ||
        Array.isArray(selectors)
    ) {
        throw new Error('Selectors must be an object.');
    }

    for (const [field, rule] of Object.entries(selectors)) {
        if (!field.trim()) {
            throw new Error('Field names cannot be empty.');
        }

        if (
            rule === null ||
            typeof rule !== 'object' ||
            Array.isArray(rule)
        ) {
            throw new Error(`Rule for "${field}" must be an object.`);
        }

        if (
            typeof rule.selector !== 'string' ||
            !rule.selector.trim()
        ) {
            throw new Error(
                `Rule "${field}" requires a non-empty selector.`
            );
        }

        if (!['text', 'attribute'].includes(rule.type)) {
            throw new Error(
                `Rule "${field}" has an unsupported type.`
            );
        }

        if (rule.type === 'attribute') {
            if (
                typeof rule.attribute !== 'string' ||
                !rule.attribute.trim()
            ) {
                throw new Error(
                    `Rule "${field}" requires an attribute name.`
                );
            }
        }

        if (
            typeof rule.multiple !== 'boolean'
        ) {
            throw new Error(
                `Rule "${field}" requires multiple to be a boolean.`
            );
        }
    }
}
