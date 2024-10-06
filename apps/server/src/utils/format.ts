export function convertTextToSlug(text: string) {
    const slug = text
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric characters with '-'
        .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
        .replace(/^-|-$/g, ''); // Remove leading or trailing hyphens

    return slug;
}
