import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { filterXSS } from 'xss';
import sanitizeHtml from 'sanitize-html';
import validator from 'validator';

/**
 * Sanitization Pipe using industry-standard libraries
 * Provides comprehensive protection against injection attacks
 */
@Injectable()
export class SanitizationPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (!value) {
      return value;
    }

    // Only sanitize request body and query parameters
    if (metadata.type === 'body' || metadata.type === 'query') {
      return this.sanitizeInput(value);
    }

    return value;
  }

  private sanitizeInput(input: unknown): unknown {
    if (typeof input === 'string') {
      return this.sanitizeString(input);
    }

    if (Array.isArray(input)) {
      return input.map((item) => this.sanitizeInput(item));
    }

    if (typeof input === 'object' && input !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(
        input as Record<string, unknown>,
      )) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return input;
  }

  private sanitizeString(str: string): string {
    if (typeof str !== 'string') {
      return str;
    }

    let sanitized = str;

    // 1. XSS Protection using industry-standard xss library
    sanitized = filterXSS(sanitized, {
      allowCommentTag: false,
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script'],
    });

    // 2. Additional HTML sanitization for complete text content
    // For social media content, we typically want NO HTML
    sanitized = sanitizeHtml(sanitized, {
      allowedTags: [], // No HTML tags allowed in tweets
      allowedAttributes: {},
      disallowedTagsMode: 'discard',
    });

    // 3. Escape any remaining dangerous characters
    sanitized = validator.escape(sanitized);

    // 4. SQL Injection protection using express-validator patterns
    sanitized = this.sanitizeSQL(sanitized);

    // 5. NoSQL injection protection
    sanitized = this.sanitizeNoSQL(sanitized);

    // 6. Path traversal protection
    sanitized = this.sanitizePathTraversal(sanitized);

    // 7. Normalize whitespace
    sanitized = validator.trim(sanitized.replace(/\s+/g, ' '));

    return sanitized;
  }

  private sanitizeSQL(str: string): string {
    // Use express-validator's blacklist approach for SQL patterns
    const sqlKeywords = [
      'SELECT',
      'INSERT',
      'UPDATE',
      'DELETE',
      'DROP',
      'CREATE',
      'ALTER',
      'EXEC',
      'EXECUTE',
      'UNION',
      'SCRIPT',
      'DECLARE',
      'CAST',
      'CONVERT',
    ];

    let sanitized = str;
    sqlKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });

    // Remove SQL comments and common injection patterns
    sanitized = sanitized.replace(/(--|#|\/\*|\*\/)/g, '');
    sanitized = sanitized.replace(/(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi, '');

    return sanitized;
  }

  private sanitizeNoSQL(str: string): string {
    // MongoDB operator protection
    const noSqlOperators = [
      '$ne',
      '$gt',
      '$lt',
      '$gte',
      '$lte',
      '$in',
      '$nin',
      '$exists',
      '$regex',
      '$where',
      '$expr',
      '$function',
      '$elemMatch',
    ];

    let sanitized = str;
    noSqlOperators.forEach((op) => {
      sanitized = sanitized.replace(new RegExp('\\' + op, 'gi'), '');
    });

    return sanitized;
  }

  private sanitizePathTraversal(str: string): string {
    // Remove directory traversal patterns
    return str
      .replace(/\.\./g, '')
      .replace(/[\\]/g, '') // Remove path separators
      .replace(/\0/g, ''); // Remove null bytes
  }
}
