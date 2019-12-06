import * as React from 'react';
import { NullableDateType, RangeValue, OnSelect } from './interface';

interface RangeContextProps {
  /**
   * Set displayed range value style.
   * Panel only has one value, this is only style effect.
   */
  rangedValue?: [NullableDateType<any>, NullableDateType<any>];
  hoverRangedValue?: RangeValue<any>;
  inRange?: boolean;
  panelPosition?: 'left' | 'right' | false;
  onSelect?: OnSelect<any>;
}

const RangeContext = React.createContext<RangeContextProps>({});

export default RangeContext;
