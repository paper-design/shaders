'use client';

import { PaperTexture } from '@paper-design/shaders-react';

export default function TestPage() {
    return (
        <div className="grid grid-cols-4 *:aspect-video">
            <PaperTexture image=""/>
            <PaperTexture/>
            <PaperTexture image="https://shaders.paper.design/images/image-filters/0018.webp"/>
        </div>
    );
}
