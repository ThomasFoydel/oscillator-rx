import React, { useState } from 'react';
import './FilterController.scss';
import DropDown from 'components/DropDown/DropDown';

const FilterController = ({
  changeFilter1Type,
  changeFilter1Freq,
  changeFilter1Q,
  changeFilter1Mix,
  changeFilter1Gain,
  initParams,
}) => {
  const [filterDisplayVals, setFilterDisplayVals] = useState(initParams);

  const updateDisplay = (id, value) => {
    setFilterDisplayVals({ ...filterDisplayVals, [id]: value });
  };

  const updateFilter = ({ target: { value, id } }) => {
    if (id === 'type') {
      changeFilter1Type(value);
      updateDisplay(id, value);
    } else if (id === 'frequency') {
      changeFilter1Freq(value);
      updateDisplay(id, value);
    } else if (id === 'Q') {
      changeFilter1Q(value);
      updateDisplay(id, value);
    } else if (id === 'mix') {
      changeFilter1Mix(value);
      updateDisplay(id, value);
    } else if (id === 'gain') {
      changeFilter1Gain(value);
      updateDisplay(id, value);
    }
  };
  const { type, frequency, Q, mix, gain } = filterDisplayVals;
  const showGainInput =
    type === 'peaking' || type === 'lowshelf' || type === 'highshelf';
  const showQInput = type !== 'lowshelf' && type !== 'highshelf';
  return (
    <div className='filter1 '>
      <h1 className='center'>filter</h1>

      <div className='sliders'>
        <div className='frequency'>
          <div className='center value-display'>
            <b>frequency </b> {filterDisplayVals.frequency}
          </div>
          <input
            className='center'
            type='range'
            max='19000'
            id='frequency'
            value={frequency}
            onChange={updateFilter}
          />
        </div>
        {showQInput && (
          <div>
            <div className='center'>
              <b>Q </b>
              {filterDisplayVals.Q}
            </div>
            <input
              className='center'
              type='range'
              value={Q}
              id='Q'
              onChange={updateFilter}
            />
          </div>
        )}

        {showGainInput && (
          <div>
            <div className='center'>
              <b>gain</b>
            </div>
            <input
              className='center'
              type='range'
              value={gain}
              id='gain'
              onChange={updateFilter}
            />
          </div>
        )}

        <div>
          <div className='center'>
            <b>mix </b>
            {filterDisplayVals.mix}
          </div>
          <input
            className='center'
            type='range'
            value={mix}
            id='mix'
            onChange={updateFilter}
          />
        </div>
      </div>

      <div className='filter1-dropdown center'>
        <DropDown
          updateFunction={updateFilter}
          inputId={'type'}
          initVal={{ val: 'highpass', text: 'highpass' }}
          options={[
            { val: 'lowpass', text: 'lowpass' },
            { val: 'highpass', text: 'highpass' },
            { val: 'lowshelf', text: 'lowshelf' },
            { val: 'highshelf', text: 'highshelf' },
            { val: 'bandpass', text: 'bandpass' },
            { val: 'peaking', text: 'peaking' },
            { val: 'notch', text: 'notch' },
            { val: 'allpass', text: 'allpass' },
          ]}
        />
      </div>
    </div>
  );
};

export default FilterController;
