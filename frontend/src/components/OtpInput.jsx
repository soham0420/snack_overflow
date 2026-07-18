import { useEffect, useRef } from "react";

// A row of `length` single-digit boxes that behaves like one field: typing
// advances focus, backspace steps back, and pasting a full code fills every
// box at once. Calls onChange with the combined string on every keystroke,
// and onComplete once all boxes are filled (used to auto-submit).
function OtpInput({ length = 6, value, onChange, onComplete, disabled = false, autoFocus = true }) {
    const inputRefs = useRef([]);
    const digits = value.padEnd(length, " ").split("").slice(0, length);

    useEffect(() => {
        if (autoFocus) {
            inputRefs.current[0]?.focus();
        }
        // Only on mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function setDigit(index, char) {
        const next = digits.slice();
        next[index] = char;
        const joined = next.join("").trimEnd();
        onChange(joined);

        if (joined.length === length && onComplete) {
            onComplete(joined);
        }
    }

    function handleChange(index, e) {
        const raw = e.target.value.replace(/\D/g, "");
        if (!raw) {
            setDigit(index, " ");
            return;
        }

        // Handles both a single keystroke and a paste landing in one box.
        const chars = raw.split("");
        chars.forEach((char, offset) => {
            if (index + offset < length) {
                setDigit(index + offset, char);
            }
        });

        const nextIndex = Math.min(index + chars.length, length - 1);
        inputRefs.current[nextIndex]?.focus();
        inputRefs.current[nextIndex]?.select();
    }

    function handleKeyDown(index, e) {
        if (e.key === "Backspace" && !digits[index].trim() && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === "ArrowRight" && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    }

    return (
        <div className="otp-input">
            {digits.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="otp-box"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={length}
                    value={digit.trim()}
                    disabled={disabled}
                    onChange={(e) => handleChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onFocus={(e) => e.target.select()}
                />
            ))}
        </div>
    );
}

export default OtpInput;
