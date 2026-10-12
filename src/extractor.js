
export function extractData($, selectors) {
    const result = {};

    for (const [field, rule] of Object.entries(selectors)) {
        const elements = $(rule.selector);

        if (rule.multiple) {
            result[field] = elements
                .map((_, element) => extractValue($(element), rule))
                .get();
        } else {
            const element = elements.first();

            result[field] = element.length
                ? extractValue(element, rule)
                : null;
        }
    }

    return result;
}

function extractValue(element, rule) {
    if (rule.type === 'text') {
        return element.text().trim();
    }

    if (rule.type === 'attribute') {
        return element.attr(rule.attribute) ?? null;
    }

    throw new Error(`Unsupported extraction type: ${rule.type}`);
}
