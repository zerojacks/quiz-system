/**
 * 将所有非标准字符转换为标准字符
 * 使用 Unicode NFKC 标准化:
 * - 将兼容字符转换为标准字符
 * - 将组合字符转换为单个字符
 * - 将全角字符转换为半角字符
 * - 将异体字转换为标准字
 * @param text 需要转换的文本
 * @returns 转换后的文本
 */
export function normalizeText(text: string): string {
    return text.normalize('NFKC');
}
