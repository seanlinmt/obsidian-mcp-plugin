/* eslint-disable no-restricted-globals -- Using Node/global fetch for MCP tool web requests */
// Using built-in fetch instead of axios
import TurndownService from 'turndown';

export const fetchTool = {
  name: 'fetch',
  description: 'Fetch and convert web content to markdown',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The URL to fetch content from'
      },
      raw: {
        type: 'boolean',
        description: 'Return raw HTML instead of converting to markdown (default: false)',
        default: false
      },
      maxLength: {
        type: 'number',
        description: 'Maximum content length to return (optional)'
      },
      startIndex: {
        type: 'number',
        description: 'Starting index for content pagination (optional)'
      }
    },
    required: ['url']
  },
  handler: async (_: unknown, args: any) => {
    try {
      // Validate URL and enforce SSRF protection
      let url;
      try {
        url = new URL(args.url);
      } catch {
        throw new Error('Invalid URL format');
      }

      const hostname = url.hostname.toLowerCase();

      // Helper to check if a string is a valid IPv6 address (not a domain name)
      // IPv6 addresses contain colons; domain names don't (except in rare edge cases with zone IDs)
      const isIPv6Address = (host: string): boolean => host.includes(':');

      // Check for private/local IPv4 ranges
      const isPrivateIPv4 =
        hostname === 'localhost' ||
        hostname.startsWith('127.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
        hostname.startsWith('0.'); // 0.0.0.0/8 is "this host"

      // Check for private/local IPv6 ranges
      // Note: URL.hostname returns IPv6 WITHOUT brackets, e.g., "::1" not "[::1]"
      const isPrivateIPv6 = isIPv6Address(hostname) && (
        hostname === '::1' ||                           // Loopback
        hostname === '::' ||                            // Unspecified address
        /^fe80:/i.test(hostname) ||                     // Link-local (fe80::/10)
        /^fc[0-9a-f]{2}:/i.test(hostname) ||            // Unique Local (fc00::/7)
        /^fd[0-9a-f]{2}:/i.test(hostname) ||            // Unique Local (fd00::/8)
        /^::ffff:(10\.|127\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/i.test(hostname) // IPv4-mapped private
      );

      const isPrivate = isPrivateIPv4 || isPrivateIPv6;

      if (isPrivate) {
        throw new Error('Access to private IP ranges and localhost is denied');
      }

      const response = await fetch(args.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let content = await response.text();

      if (!args.raw && typeof content === 'string' && content.includes('<')) {
        const turndown = new TurndownService({
          headingStyle: 'atx',
          codeBlockStyle: 'fenced'
        });
        content = turndown.turndown(content);
      }

      if (args.startIndex || args.maxLength) {
        const start = args.startIndex || 0;
        const end = args.maxLength ? start + args.maxLength : undefined;
        content = content.slice(start, end);
      }

      return {
        content: [{
          type: 'text',
          text: content
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `Error fetching URL: ${error.message}`
        }],
        isError: true
      };
    }
  }
};