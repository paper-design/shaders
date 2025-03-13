'use client';
import {SteppedSimplexNoise} from '@paper-design/shaders-react';
import {useControls} from 'leva';

const MyTest = () => {
    const {left, top, width, height} = useControls('canvas', {
        left: {value: 150, min: 0, max: 200},
        top: {value: 150, min: 0, max: 200},
        width: {value: 600, min: 10, max: 1000},
        height: {value: 400, min: 10, max: 1000},
    });

    const {worldWidth, worldHeight} = useControls('shader', {
        worldWidth: {value: 300, min: 10, max: 1000},
        worldHeight: {value: 300, min: 10, max: 1000},
    });

    return (
        <>
            <div style={{
                position: 'fixed',
                left: `10px`,
                top: `10px`,
            }}><span style={{color: 'red'}}>red</span>: world size in px</div>
            <div
                style={{
                    position: 'fixed',
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                }}
            >
                <SteppedSimplexNoise
                    style={{width: '100%', height: '100%'}}
                    worldWidth={worldWidth}
                    worldHeight={worldHeight}
                    speed={0}
                />
            </div>
        </>
    );
};

export default MyTest;

