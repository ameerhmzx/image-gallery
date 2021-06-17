const round = (value, decimals) => {
    if (!decimals) decimals = 0;
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
};

// guesstimate how many neighboring nodes should be searched based on
// the aspect ratio of the container with images having an avg AR of 1.5
// as the minimum amount of photos per row, plus some nodes
export const findIdealNode = ({ targetRowHeight, containerWidth }) => {
    const rowAR = containerWidth / targetRowHeight;
    return round(rowAR / 1.5) + 8;
};