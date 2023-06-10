import {
  cloneElement,
  Component,
  FunctionComponent,
  isValidElement,
  JSX,
  PropsWithChildren,
} from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { Children, forwardRef } from "react";

const Tabs: FunctionComponent<
  PropsWithChildren<{
    value?: string;
    onChange?: (v: string) => void;
  }>
> = ({ children, value, onChange }) => {
  const [_activeKey, setActiveKey] = useState(
    value ?? (Children.toArray(children)[0] as any)?.key
  );
  const indicatorRef = useRef(null);
  console.log("tabs", _activeKey);
  const [div, setDiv] = useState<HTMLDivElement | null>(null);

  const handle = useCallback((div: HTMLDivElement | null) => {
    console.log("ref2", div);
    if (!div) return;
    console.log("in", div.offsetLeft, div.offsetWidth);
    setDiv(div);
  }, []);

  return (
    <div>
      <div className="flex">
        {Children.map(children, (child) => {
          return isValidElement(child)
            ? cloneElement(child, {
                onClick: function (...args: any) {
                  console.log(args, child.key);
                  (onChange ?? setActiveKey)(child.key);
                },
                ref: (value ?? _activeKey) === child.key ? handle : null,
              })
            : child;
        })}
      </div>
      <div className="h-1 relative">
        <div
          ref={indicatorRef}
          className="absolute top-0 bottom-0 bg-pink rounded transition-all"
          style={{ left: (div?.offsetLeft ?? 0) - 12, width: div?.offsetWidth }}
        ></div>
      </div>
    </div>
  );
};
export const Tab = forwardRef<HTMLDivElement, JSX.IntrinsicElements["div"]>(
  (props, ref) => {
    console.log("ref", ref);
    const { className, ...rest } = props;
    return (
      <div
        className={`p-2 cursor-pointer ${className}`}
        {...rest}
        ref={ref}
      ></div>
    );
  }
);
export { Tabs };
