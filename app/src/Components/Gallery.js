import React, {useState, useLayoutEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';

import {computeRowLayout} from '../utils/Justified';
import {findIdealNode} from '../utils/FindIdealNode';

const Gallery = React.memo(
    function Gallery(
        {
            photos,
            render_image,
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

        // TODO: handle on image click
        // const handleClick = (event, {index}) => {
        //     onClick(event, {
        //         index,
        //         photo: photos[index],
        //         previous: photos[index - 1] || null,
        //         next: photos[index + 1] || null,
        //     });
        // };

        // no containerWidth until after first render with refs, skip calculations and render nothing
        if (!containerWidth) return <div ref={galleryEl}>&nbsp;</div>;
        // subtract 1 pixel because the browser may round up a pixel
        const width = containerWidth - 1;
        let galleryStyle, thumbs, limitNodeSearch, targetRowHeight = 300, margin = 2;

        // set how many neighboring nodes the graph will visit
        if (limitNodeSearch === undefined) {
            limitNodeSearch = 1;
            if (containerWidth >= 400) {
                limitNodeSearch = findIdealNode({containerWidth, targetRowHeight});
            }
        }

        galleryStyle = {display: 'flex', flexWrap: 'wrap', flexDirection: 'row'};
        thumbs = computeRowLayout({containerWidth: width, limitNodeSearch, targetRowHeight, margin, photos});

        return (
            <div ref={galleryEl} style={galleryStyle}>
                {thumbs.map((thumb, i) => {
                    return render_image(thumb);
                })}
            </div>
        );
    });

const photoPropType = PropTypes.shape({
    id: PropTypes.string.isRequired,
    src: PropTypes.string.isRequired,
    thumb: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
});

Gallery.propTypes = {
    photos: PropTypes.arrayOf(photoPropType).isRequired,
    onClick: PropTypes.func,
    render_image: PropTypes.func.isRequired,
};

export default Gallery;
