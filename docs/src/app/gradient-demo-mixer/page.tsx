'use client';

import {
    GradientDemoMixer,
    type GradientDemoMixerParams,
    gradientDemoMixerPresets,
    gradientDemoMixerMaxColorCount,
} from '@paper-design/shaders-react';
import {useControls, button, folder} from 'leva';
import {setParamsSafe, useResetLevaParams} from '@/helpers/use-reset-leva-params';
import {usePresetHighlight} from '@/helpers/use-preset-highlight';
import {cleanUpLevaParams} from '@/helpers/clean-up-leva-params';
import Link from 'next/link';
import {BackButton} from '@/components/back-button';

/**
 * You can copy/paste this example to use GradientDemoMixer in your app
 */
const GradientDemoMixerExample = () => {
    return (
        <GradientDemoMixer
            colors={['#b3a6ce', '#562b9c', '#f4e8b8', '#c79acb']}
            speed={0.15}
            style={{position: 'fixed', width: '100%', height: '100%'}}
        />
    );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = gradientDemoMixerPresets[0].params;

const GradientDemoMixerWithControls = () => {
    const [{colorCount}, setColorCount] = useControls(() => ({
        Colors: folder({
            colorCount: {
                value: defaults.colors.length,
                min: 2,
                max: gradientDemoMixerMaxColorCount,
                step: 1,
            },
        }),
    }));

    const [levaColors, setLevaColors] = useControls(() => {
        const colors: Record<string, { value: string }> = {};

        for (let i = 0; i < colorCount; i++) {
            colors[`color${i}`] = {
                value: defaults.colors[i] ?? 'hsla(' + Math.random() * 360 + ', 50%, 50%, 1)',
            };
        }

        return {
            Colors: folder(colors),
        };
    }, [colorCount]);

    const [params, setParams] = useControls(() => {
        const presets: GradientDemoMixerParams = Object.fromEntries(
            gradientDemoMixerPresets.map((preset) => {
                return [
                    preset.name,
                    button(() => {
                        const {colors, ...presetParams} = preset.params;
                        setParamsSafe(params, setParams, presetParams);
                        setColorCount({colorCount: colors.length});

                        const presetColors = Object.fromEntries(
                            colors.map((color, index) => {
                                return [`color${index}`, color];
                            })
                        );

                        setColorCount({colorCount: colors.length});
                        setParamsSafe(levaColors, setLevaColors, presetColors);
                    }),
                ];
            })
        );

        return {
            Parameters: folder(
                {
                    test: {value: defaults.test, min: 0, max: 3, order: 400},
                },
                {order: 1}
            ),
            Presets: folder(presets as Record<string, string>, {order: 2}),
        };
    }, [colorCount]);

    // Reset to defaults on mount, so that Leva doesn't show values from other
    // shaders when navigating (if two shaders have a color1 param for example)
    useResetLevaParams(params, setParams, defaults);
    usePresetHighlight(gradientDemoMixerPresets, params);
    cleanUpLevaParams(params);

    const colors = Object.values(levaColors) as unknown as string[];

    return (
        <>
            <Link href="/">
                <BackButton/>
            </Link>
            <div className="fixed flex size-full flex-col" style={{width: 'calc(100% - 400px)'}}>
                <GradientDemoMixer {...params} colors={colors} className="h-3/5"/>
                <div
                    className="h-1/5"
                    style={{
                        background: `linear-gradient(to right in oklch, ${colors.join(", ")})`,
                    }}
                />
                <div
                    className="h-1/5"
                    style={{
                        background: `linear-gradient(to right, ${colors.join(", ")})`,
                    }}
                />
            </div>
        </>
    );
};

export default GradientDemoMixerWithControls;
