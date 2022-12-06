import { isDefined } from '../../../utils/isDefined';
import type { Dictionary } from '../../../utils/types';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiMediaType } from '../interfaces/OpenApiMediaType';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';

export interface Content {
    mediaType: string;
    schema: OpenApiSchema;
}

const BASIC_MEDIA_TYPES = [
    'application/json-patch+json',
    'application/json',
    'application/x-www-form-urlencoded',
    'text/json',
    'text/plain',
    'multipart/form-data',
    'multipart/mixed',
    'multipart/related',
    'multipart/batch',
];

const STREAM_MEDIA_TYPE = 'application/octet-stream';

interface MediaType {
    schema: {
        type: string;
        format: string;
    };
}

export const getContent = (openApi: OpenApi, content: Dictionary<OpenApiMediaType>): Content | null => {
    const octetStreamMediaType = Object.keys(content).find((mediaType: string) => {
        return mediaType === STREAM_MEDIA_TYPE;
    });

    if (isDefined(octetStreamMediaType)) {
        const streamMediaType: MediaType = content[octetStreamMediaType] as MediaType;
        const type = streamMediaType?.schema?.type;
        const format = streamMediaType?.schema?.format;

        if (type === 'string' && format === 'byte') {
            return {
                mediaType: octetStreamMediaType,
                schema: content[octetStreamMediaType].schema as OpenApiSchema,
            };
        }
    }

    const basicMediaTypeWithSchema = Object.keys(content)
        .filter(mediaType => {
            const cleanMediaType = mediaType.split(';')[0].trim();
            return BASIC_MEDIA_TYPES.includes(cleanMediaType);
        })
        .find(mediaType => isDefined(content[mediaType]?.schema));

    if (basicMediaTypeWithSchema) {
        return {
            mediaType: basicMediaTypeWithSchema,
            schema: content[basicMediaTypeWithSchema].schema as OpenApiSchema,
        };
    }

    const firstMediaTypeWithSchema = Object.keys(content).find(mediaType => isDefined(content[mediaType]?.schema));
    if (firstMediaTypeWithSchema) {
        return {
            mediaType: firstMediaTypeWithSchema,
            schema: content[firstMediaTypeWithSchema].schema as OpenApiSchema,
        };
    }

    return null;
};
