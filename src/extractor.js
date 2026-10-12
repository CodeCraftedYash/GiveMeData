
export function extractData($, selectors, itemSelector) {
    if (itemSelector) {
        return $(itemSelector)
            .map((_, item) => {
                const card = $(item);
                const record = {};

                for (const [field, rule] of Object.entries(selectors)) {
                    const elements = card.find(rule.selector);

                    if (rule.multiple) {
                        record[field] = elements
                            .map((_, element) =>
                                extractValue($(element), rule)
                            )
                            .get();
                    } else {
                        const element = elements.first();

                        record[field] = element.length
                            ? extractValue(element, rule)
                            : null;
                    }
                }

                return record;
            })
            .get();
    }

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
        return element.text().replace(/\s+/g, ' ').trim();
    }

    if (rule.type === 'attribute') {
        return element.attr(rule.attribute) ?? null;
    }

    throw new Error(`Unsupported extraction type: ${rule.type}`);
}
