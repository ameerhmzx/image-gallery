import React, {useState, useLayoutEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';

import {computeRowLayout} from '../utils/Justified';
import {findIdealNode} from '../utils/FindIdealNode';

const Gallery = React.memo(
    function Gallery(
        {
            photos,
            onClick,
        }) {
        const [containerWidth, setContainerWidth] = useState(0);
        const galleryEl = useRef(null);

        useLayoutEffect(() => {
            let animationFrameID = null;
            const observer = new ResizeObserver(entries => {
                // only do something if width changes
                const newWidth = entries[0].contentRect.width;
                if (containerWidth !== newWidth) {
                    // put in an animation frame to stop "benign errors" from
                    // ResizeObserver https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded
                    animationFrameID = window.requestAnimationFrame(() => {
                        setContainerWidth(Math.floor(newWidth));
                    });
                }
            });
            observer.observe(galleryEl.current);
            return () => {
                observer.disconnect();
                window.cancelAnimationFrame(animationFrameID);
            };
        });

        const handleClick = (event, {index}) => {
            onClick(event, {
                index,
                photo: photos[index],
                previous: photos[index - 1] || null,
                next: photos[index + 1] || null,
            });
        };

        // no containerWidth until after first render with refs, skip calculations and render nothing
        if (!containerWidth) return <div ref={galleryEl}>&nbsp;</div>;
        // subtract 1 pixel because the browser may round up a pixel
        const width = containerWidth - 1;
        let galleryStyle, thumbs, limitNodeSearch, targetRowHeight = 240, margin = 2;

        // set how many neighboring nodes the graph will visit
        if (limitNodeSearch === undefined) {
            limitNodeSearch = 2;
            if (containerWidth >= 450) {
                limitNodeSearch = findIdealNode({containerWidth, targetRowHeight});
            }
        }

        galleryStyle = {display: 'flex', flexWrap: 'wrap', flexDirection: 'row'};
        thumbs = computeRowLayout({containerWidth: width, limitNodeSearch, targetRowHeight, margin, photos});

        return (
            <div ref={galleryEl} style={galleryStyle}>
                {thumbs.map((thumb, i) => {
                    const {containerHeight, ...photo} = thumb;
                    return (<img
                        key={thumb.key || thumb.src}
                        {...photo}
                        className={`p-px rounded-md object-cover`}
                        onClick={onClick ? handleClick : null}
                        alt={thumb.key || `undefined`}
                    />)
                })}
            </div>
        );
    });

const photoPropType = PropTypes.shape({
    key: PropTypes.string,
    src: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    alt: PropTypes.string,
    title: PropTypes.string,
    srcSet: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    sizes: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
});

Gallery.propTypes = {
    photos: PropTypes.arrayOf(photoPropType).isRequired,
    onClick: PropTypes.func,
};

export default Gallery;
