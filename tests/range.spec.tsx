import React from 'react';
import MockDate from 'mockdate';
import {
  mount,
  getMoment,
  isSame,
  MomentRangePicker,
  Wrapper,
} from './util/commonUtil';

describe('Range', () => {
  function matchValues(wrapper: Wrapper, value1: string, value2: string) {
    expect(
      wrapper
        .find('input')
        .first()
        .props().value,
    ).toEqual(value1);
    expect(
      wrapper
        .find('input')
        .last()
        .props().value,
    ).toEqual(value2);
  }

  beforeAll(() => {
    MockDate.set(getMoment('1990-09-03 00:00:00').toDate());
  });

  afterAll(() => {
    MockDate.reset();
  });

  describe('value', () => {
    it('defaultValue', () => {
      const wrapper = mount(
        <MomentRangePicker
          defaultValue={[getMoment('1989-11-28'), getMoment('1990-09-03')]}
        />,
      );

      matchValues(wrapper, '1989-11-28', '1990-09-03');
    });

    it('controlled', () => {
      const wrapper = mount(
        <MomentRangePicker
          value={[getMoment('1989-11-28'), getMoment('1990-09-03')]}
        />,
      );

      matchValues(wrapper, '1989-11-28', '1990-09-03');

      // Update
      wrapper.setProps({
        value: [getMoment('2000-01-01'), getMoment('2011-12-12')],
      });
      wrapper.update();
      matchValues(wrapper, '2000-01-01', '2011-12-12');
    });

    it('uncontrolled', () => {
      const onChange = jest.fn();
      const onCalendarChange = jest.fn();
      const wrapper = mount(
        <MomentRangePicker
          onChange={onChange}
          onCalendarChange={onCalendarChange}
        />,
      );

      // Start date
      wrapper.openPicker();
      wrapper.selectCell(13, 0);
      wrapper.closePicker();

      expect(onChange).not.toHaveBeenCalled();

      expect(
        isSame(onCalendarChange.mock.calls[0][0][0], '1990-09-13'),
      ).toBeTruthy();
      expect(onCalendarChange.mock.calls[0][0][1]).toBeFalsy();
      expect(onCalendarChange.mock.calls[0][1]).toEqual(['1990-09-13', '']);

      // End date
      onCalendarChange.mockReset();
      wrapper.openPicker(1);
      wrapper.selectCell(14, 1);
      wrapper.closePicker(1);

      expect(isSame(onChange.mock.calls[0][0][0], '1990-09-13')).toBeTruthy();
      expect(isSame(onChange.mock.calls[0][0][1], '1990-09-14')).toBeTruthy();
      expect(onChange.mock.calls[0][1]).toEqual(['1990-09-13', '1990-09-14']);

      expect(
        isSame(onCalendarChange.mock.calls[0][0][0], '1990-09-13'),
      ).toBeTruthy();
      expect(
        isSame(onCalendarChange.mock.calls[0][0][1], '1990-09-14'),
      ).toBeTruthy();
      expect(onCalendarChange.mock.calls[0][1]).toEqual([
        '1990-09-13',
        '1990-09-14',
      ]);
    });
  });

  it('exchanged value should re-order', () => {
    const wrapper = mount(
      <MomentRangePicker
        defaultValue={[getMoment('1990-09-03'), getMoment('1989-11-28')]}
      />,
    );

    matchValues(wrapper, '1989-11-28', '1990-09-03');
  });

  it('endDate can not click before startDate', () => {
    const onChange = jest.fn();

    const wrapper = mount(
      <MomentRangePicker
        onChange={onChange}
        disabledDate={date => date.date() === 28}
        allowClear
      />,
    );

    let cellNode: Wrapper;

    // Start date
    wrapper.openPicker();
    wrapper.selectCell(23);
    wrapper.closePicker();

    // End date
    wrapper.openPicker(1);
    cellNode = wrapper.selectCell(11);
    expect(
      cellNode.hasClass('rc-picker-date-panel-cell-disabled'),
    ).toBeTruthy();
    wrapper.closePicker(1);
    expect(onChange).not.toHaveBeenCalled();

    // Click start origin disabled date
    wrapper.openPicker();
    cellNode = wrapper.selectCell(28);
    expect(
      cellNode.hasClass('rc-picker-date-panel-cell-disabled'),
    ).toBeTruthy();
    wrapper.closePicker();
    expect(onChange).not.toHaveBeenCalled();

    // Click end origin disabled date
    wrapper.openPicker(1);
    cellNode = wrapper.selectCell(28, 1);
    expect(
      cellNode.hasClass('rc-picker-date-panel-cell-disabled'),
    ).toBeTruthy();
    wrapper.closePicker(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Reset when startDate is after endDate', () => {
    const onChange = jest.fn();
    const wrapper = mount(<MomentRangePicker onChange={onChange} />);

    wrapper.openPicker(1);
    wrapper.selectCell(7, 1);
    wrapper.closePicker(1);

    wrapper.openPicker(0);
    wrapper.selectCell(23, 0);
    wrapper.closePicker(0);
    expect(onChange).not.toHaveBeenCalled();
    matchValues(wrapper, '1990-09-23', '');
  });

  it('allowEmpty', () => {
    const onChange = jest.fn();
    const wrapper = mount(
      <MomentRangePicker
        onChange={onChange}
        allowEmpty={[false, true]}
        allowClear
      />,
    );

    wrapper.openPicker();
    wrapper.selectCell(11);
    wrapper.closePicker();
    expect(onChange).toHaveBeenCalledWith(
      [expect.anything(), null],
      ['1990-09-11', ''],
    );

    wrapper.clearValue();
    onChange.mockReset();

    // Not allow empty with startDate
    wrapper.openPicker(1);
    wrapper.selectCell(23, 1);
    wrapper.closePicker(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  describe('selectable', () => {
    it('basic disabled check', () => {
      const wrapper = mount(<MomentRangePicker selectable={[false, true]} />);
      expect(
        wrapper
          .find('input')
          .at(0)
          .props().disabled,
      ).toBeTruthy();
      expect(
        wrapper
          .find('input')
          .at(1)
          .props().disabled,
      ).toBeFalsy();
    });

    it('startDate will have disabledDate when endDate is not selectable', () => {
      const onChange = jest.fn();
      const wrapper = mount(
        <MomentRangePicker
          selectable={[true, false]}
          defaultValue={[null, getMoment('1990-09-22')]}
          onChange={onChange}
        />,
      );

      let cellNode: Wrapper;

      // Disabled date
      wrapper.openPicker();
      cellNode = wrapper.selectCell(25);
      expect(
        cellNode.hasClass('rc-picker-date-panel-cell-disabled'),
      ).toBeTruthy();
      wrapper.closePicker();
      expect(onChange).not.toHaveBeenCalled();

      // Enabled date
      wrapper.openPicker();
      cellNode = wrapper.selectCell(7);
      expect(
        cellNode.hasClass('rc-picker-date-panel-cell-disabled'),
      ).toBeFalsy();
      wrapper.closePicker();
      expect(onChange).toHaveBeenCalledWith(
        [expect.anything(), expect.anything()],
        ['1990-09-07', '1990-09-22'],
      );
    });
  });

  it('ranges', () => {
    const onChange = jest.fn();
    const wrapper = mount(
      <MomentRangePicker
        ranges={{ test: [getMoment('1989-11-28'), getMoment('1990-09-03')] }}
        onChange={onChange}
      />,
    );

    wrapper.openPicker();
    const testNode = wrapper.find('.rc-picker-ranges li');
    expect(testNode.text()).toEqual('test');
    testNode.simulate('click');
    expect(onChange).toHaveBeenCalledWith(
      [expect.anything(), expect.anything()],
      ['1989-11-28', '1990-09-03'],
    );
  });

  it('placeholder', () => {
    const wrapper = mount(
      <MomentRangePicker placeholder={['light', 'bamboo']} />,
    );
    expect(
      wrapper
        .find('input')
        .first()
        .props().placeholder,
    ).toEqual('light');
    expect(
      wrapper
        .find('input')
        .last()
        .props().placeholder,
    ).toEqual('bamboo');
  });

  it('defaultPickerValue', () => {
    const wrapper = mount(
      <MomentRangePicker
        defaultPickerValue={[getMoment('1989-11-28'), getMoment('1990-09-03')]}
      />,
    );

    wrapper.openPicker();
    expect(
      wrapper
        .find('PickerPanel')
        .first()
        .find('.rc-picker-date-panel-header-view')
        .text(),
    ).toEqual('Nov1989');
    wrapper.closePicker();

    wrapper.openPicker(1);
    expect(
      wrapper
        .find('PickerPanel')
        .last()
        .find('.rc-picker-date-panel-header-view')
        .text(),
    ).toEqual('Sep1990');
    wrapper.closePicker(1);
  });
});
