import React, { useCallback, useEffect, useState } from "react";

import type { InputProps } from "@acme/ui/input";
import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";

interface NumberInputProps extends Omit<InputProps, "onChange"> {
  onChange?: (value: number) => void;
  quickFillValues?: number[];
}

export const NumberInput: React.FC<NumberInputProps> = ({
  onChange,
  quickFillValues,
  ...props
}) => {
  const [value, setValue] = useState<string>(
    props.value
      ? props.value.toString()
      : props.defaultValue
        ? props.defaultValue.toString()
        : "",
  );

  const handleChange = useCallback(
    (newValue: string | number) => {
      const rawValue = newValue.toString().replaceAll(/[^\d.]/g, "");
      setValue(rawValue);
      if (onChange) {
        onChange(Number.parseFloat(rawValue) || 0);
      }
    },
    [onChange],
  );

  useEffect(() => {
    if (props.value !== undefined) {
      handleChange(props.value.toString());
    }
  }, [props.value, handleChange]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(event.target.value);
  };

  const handleQuickFill = (fillValue: number) => {
    setValue(fillValue.toString());
    if (onChange) {
      onChange(fillValue);
    }
  };

  return (
    <div className="w-full">
      <Input
        {...props}
        type="text"
        value={value}
        defaultValue={props.value}
        onChange={handleInputChange}
        onFocus={(event) => event.target.select()}
      />
      {quickFillValues && quickFillValues.length > 0 && (
        <div className="mt-2 grid grid-cols-4 gap-2">
          {quickFillValues.map((value, index) => (
            <Button
              key={`quick-fill-${index}`}
              size="sm"
              variant="outline"
              onClick={() => handleQuickFill(value)}
              type="button"
            >
              {value}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
