import type { JSONSchemaType } from 'ajv';

export const mediaSchema: JSONSchemaType<{
  image_url?: string;
  image_alt?: string;
  image_caption?: string;
  video_url?: string;
  video_poster?: string;
  background_image?: string;
}> = {
  type: 'object',
  properties: {
    image_url: { type: 'string', nullable: true },
    image_alt: { type: 'string', nullable: true },
    image_caption: { type: 'string', nullable: true },
    video_url: { type: 'string', nullable: true },
    video_poster: { type: 'string', nullable: true },
    background_image: { type: 'string', nullable: true },
  },
  additionalProperties: false,
};

export const mediaExample = {
  image_url: 'https://example.com/image.jpg',
  image_alt: 'Descriptive alt text for accessibility',
  image_caption: 'Optional caption for the image',
  video_url: 'https://example.com/video.mp4',
  video_poster: 'https://example.com/poster.jpg',
  background_image: 'https://example.com/background.jpg',
};
