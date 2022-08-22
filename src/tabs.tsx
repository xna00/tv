import {
  cloneElement,
  Component,
  FunctionComponent,
  isValidElement,
  JSX,
  toChildArray,
} from "preact";
import { useCallback, useMemo, useRef, useState } from "preact/hooks";
import { Children, ForwardFn, forwardRef } from "preact/compat";

const Tabs: FunctionComponent<{
  value?: string;
  onChange?: (v: string) => void;
}> = ({ children, value, onChange }) => {
  const [_activeKey, setActiveKey] = useState(
    value ?? toChildArray(children)?.[0]?.key
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
      <div class="flex">
        {Children.map(children, (child) => {
          return isValidElement(child)
            ? cloneElement(child, {
                onClick: function (...args: any) {
                  console.log(args, child.key);
                  (onChange ?? setActiveKey)(child.key);
                },
                ref: _activeKey === child.key ? handle : null,
              })
            : child;
        })}
      </div>
      <div class="h-1 relative">
        <div
          ref={indicatorRef}
          class="absolute top-0 bottom-0 bg-pink rounded transition-all"
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
