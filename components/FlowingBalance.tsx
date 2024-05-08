import { Heading } from "@chakra-ui/react";
import React, { useEffect, useState, useMemo, memo } from "react";
import { formatEther } from "viem";

// Constants
export const ANIMATION_MINIMUM_STEP_TIME = 40;

// Utility functions
export const absoluteValue = (n: bigint) => {
    return n >= BigInt(0) ? n : -n;
};

export function toFixedUsingString(
    numStr: string,
    decimalPlaces: number = 5
): string {
    const [wholePart, decimalPart] = numStr.split(".");

    if (!decimalPart || decimalPart.length <= decimalPlaces) {
        // padEnd(targetLength, padString)
        return numStr.padEnd(wholePart.length + 1 + decimalPlaces, "0");
    }

    // Rounding up if the number after decimalPlaces length is greater than 5
    // 5.04924379 = 5.049244
    const decimalPartBigInt = BigInt(
        `${decimalPart.slice(0, decimalPlaces)}${
            decimalPart[decimalPlaces] >= "5" ? "1" : "0"
        }`
    );

    return `${wholePart}.${decimalPartBigInt
        .toString()
        .padStart(decimalPlaces, "0")}`;
}

// Hooks
export const useSignificantFlowingDecimal = (
    flowRate: bigint,
    animationStepTimeInMs: number
): number | undefined =>
    useMemo(() => {
        if (flowRate === BigInt(0)) {
            return undefined;
        }

        const ticksPerSecond = 1000 / animationStepTimeInMs;
        const flowRatePerTick = flowRate / BigInt(ticksPerSecond);

        const [beforeEtherDecimal, afterEtherDecimal] =
            formatEther(flowRatePerTick).split(".");

        // What does this mean?
        // Does this mean that any positive flow the decimalPlaces value will be 0?
        const isFlowingInWholeNumbers =
            absoluteValue(BigInt(beforeEtherDecimal)) > BigInt(0);

        // Does this mean that any positive flow the decimalPlaces value will be 0?
        if (isFlowingInWholeNumbers) {
            return 0; // Flowing in whole numbers per tick.
        }

        // 5.002143
        // numberAfterDecimalWithoutLeadingZeroes = 2143
        const numberAfterDecimalWithoutLeadingZeroes =
            BigInt(afterEtherDecimal);

        // afterEtherDecimal = 002143
        // "002143" -> "00" -> lengthToFirstSignificantDecimal = 2
        // Is this correct?
        const lengthToFirstSignificantDecimal = afterEtherDecimal
            .toString()
            .replace(
                numberAfterDecimalWithoutLeadingZeroes.toString(),
                ""
            ).length; // We're basically counting the zeroes.

        return Math.min(lengthToFirstSignificantDecimal, 18); // Don't go over 18.
    }, [flowRate, animationStepTimeInMs]);

const useFlowingBalance = (
    startingBalance: bigint[],
    startingBalanceDate: Date[],
    flowRate: bigint[]
) => {
    // Add startingBalances here.
    let initialValue = BigInt(0);

    let effectiveStartingBalace = startingBalance.reduce(
        (accumulator, balance) => accumulator + balance,
        initialValue
    );

    const [flowingBalance, setFlowingBalance] = useState(
        effectiveStartingBalace
    );

    const startingBalanceTime = startingBalanceDate[0].getTime();

    useEffect(() => {
        if (flowRate.length === 0) return;

        let lastAnimationTimestamp = 0;

        const animationStep = (currentAnimationTimestamp: number) => {
            const animationFrameId =
                window.requestAnimationFrame(animationStep);

            // Checking if animation update is needed 1000 - 40 (default value)
            if (
                currentAnimationTimestamp - lastAnimationTimestamp >
                ANIMATION_MINIMUM_STEP_TIME
            ) {
                let effectiveFlowingBalance_ = BigInt(0);

                for (let i = 0; i < startingBalance.length; i++) {
                    const startingBalanceTime =
                        startingBalanceDate[i].getTime();

                    // Calculate elapsedTimeInMilliseconds for every stream individually

                    const elapsedTimeInMilliseconds = BigInt(
                        Date.now() - startingBalanceTime
                    );

                    // Divide by 1000 or 10,000?
                    const flowingBalance_ =
                        startingBalance[i] +
                        (flowRate[i] * elapsedTimeInMilliseconds) /
                            BigInt(1000);

                    effectiveFlowingBalance_ += flowingBalance_;
                }

                setFlowingBalance(effectiveFlowingBalance_);

                lastAnimationTimestamp = currentAnimationTimestamp;
            }

            return () => window.cancelAnimationFrame(animationFrameId);
        };

        let animationFrameId = window.requestAnimationFrame(animationStep);

        return () => window.cancelAnimationFrame(animationFrameId);
    }, [startingBalance, startingBalanceTime, flowRate]);

    return flowingBalance;
};

// FlowingBalance Component
const FlowingBalance: React.FC<{
    startingBalance: bigint[];
    startingBalanceDate: Date[];
    flowRate: bigint[];
    size?: string;
}> = memo(({ startingBalance, startingBalanceDate, flowRate, size = "md" }) => {
    const flowingBalance = useFlowingBalance(
        startingBalance,
        startingBalanceDate,
        flowRate
    );

    // Add flowRates here for the below function.
    let effectiveFlowRate = flowRate.reduce(
        (accumulator, flowRate) => accumulator + flowRate,
        BigInt(0)
    );

    const decimalPlaces = useSignificantFlowingDecimal(
        effectiveFlowRate,
        ANIMATION_MINIMUM_STEP_TIME
    );

    return (
        <Heading className="flowing-balance" size={size}>
            {decimalPlaces !== undefined
                ? toFixedUsingString(formatEther(flowingBalance), decimalPlaces)
                : toFixedUsingString(formatEther(flowingBalance), 5)}
        </Heading>
    );
});

FlowingBalance.displayName = "FlowingBalance";

export default FlowingBalance;
