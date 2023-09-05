// main.test.js

const clickHandler = require('./main');

test('check the intersection coordinates for a specific mouse click', () => {
    const {intersectPositionX, intersectPositionY} = clickHandler(100, 200); // you may need to adjust the values to match the specific mouse click position for your test

    const expectedX = 1; // replace with expected value
    const expectedY = 2; // replace with expected value

    expect(intersectPositionX).toBeCloseTo(expectedX, 0);
    expect(intersectPositionY).toBeCloseTo(expectedY, 0);
});