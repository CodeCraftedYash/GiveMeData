export function findProfile(targetUrl, profiles) {
    let parsedUrl;

    try {
        parsedUrl = new URL(targetUrl);
    } catch {
        throw new Error(`Invalid URL: ${targetUrl}`);
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error(`Unsupported URL protocol: ${parsedUrl.protocol}`);
    }

    const matches = profiles.filter(({ file, profile }) =>
        profile.urlPatterns.some(pattern => {
            try {
                return new RegExp(pattern).test(targetUrl);
            } catch {
                throw new Error(
                    `Invalid URL pattern in ${file}: ${pattern}`
                );
            }
        })
    );

    if (matches.length === 0) {
        throw new Error(`No selector profile matches: ${targetUrl}`);
    }

    if (matches.length > 1) {
        throw new Error(
            `Multiple selector profiles match ${targetUrl}: ${
                matches.map(item => item.file).join(', ')
            }`
        );
    }

    return matches[0];
}