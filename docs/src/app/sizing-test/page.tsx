'use client';
import {SmokeRing} from '@paper-design/shaders-react';
import {useControls} from 'leva';

const MyTest = () => {
    const {left, top, width, height} = useControls('canvas', {
        left: {value: 150, min: 0, max: 200},
        top: {value: 150, min: 0, max: 200},
        width: {value: 600, min: 10, max: 1000},
        height: {value: 400, min: 10, max: 1000},
    });

    const {fit, worldWidth, worldHeight} = useControls('shader', {
        fit: {value: 0, min: 0, max: 1, step: 1},
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
            <div style={{
                position: 'fixed',
                left: `10px`,
                top: `50px`,
            }}>
                <div>
                    <b>fit = 0</b>: contain
                </div>
                <div>
                    <b>fit = 1</b>: cover
                </div>
            </div>
            <div
                style={{
                    position: 'fixed',
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                }}
            >
                <SmokeRing
                    style={{width: '100%', height: '100%'}}
                    worldWidth={worldWidth}
                    worldHeight={worldHeight}
                    fit={fit}
                />
            </div>
        </>
    );
};

export default MyTest;

