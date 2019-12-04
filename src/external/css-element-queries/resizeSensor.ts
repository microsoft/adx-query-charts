'use strict';

/**
 * Copyright Marc J. Schmidt. See the LICENSE file at the top-level
 * directory of this distribution and at
 * https://github.com/marcj/css-element-queries/blob/master/LICENSE.
 */
export class ResizeSensor {
    private element: Element;
    private onResize: () => void;
    private currentWidth: number;
    private currentHeight: number;
    private expand: HTMLDivElement;
    private shrink: HTMLDivElement;

    public constructor(element: Element, onResize: () => void) {
        this.element = element;
        this.onResize = onResize;
        let zIndex: any = window.document.defaultView.getComputedStyle(element).getPropertyValue('z-index');
        
        if(isNaN(zIndex)) { 
            zIndex = 0; 
        };
        
        zIndex--;
    
        this.expand = document.createElement('div');
        this.expand.style.position = 'absolute';
        this.expand.style.left = '0px';
        this.expand.style.top = '0px';
        this.expand.style.right = '0px';
        this.expand.style.bottom = '0px';
        this.expand.style.overflow = 'hidden';
        this.expand.style.zIndex = zIndex.toString();
        this.expand.style.visibility = 'hidden';
    
        let expandChild = document.createElement('div');
        expandChild.style.position = 'absolute';
        expandChild.style.left = '0px';
        expandChild.style.top = '0px';
        expandChild.style.width = '10000000px';
        expandChild.style.height = '10000000px';
        this.expand.appendChild(expandChild);
    
        this.shrink = document.createElement('div');
        this.shrink.style.position = 'absolute';
        this.shrink.style.left = '0px';
        this.shrink.style.top = '0px';
        this.shrink.style.right = '0px';
        this.shrink.style.bottom = '0px';
        this.shrink.style.overflow = 'hidden';
        this.shrink.style.zIndex = zIndex;
        this.shrink.style.visibility = 'hidden';
    
        let shrinkChild = document.createElement('div');
        shrinkChild.style.position = 'absolute';
        shrinkChild.style.left = '0px';
        shrinkChild.style.top = '0px';
        shrinkChild.style.width = '200%';
        shrinkChild.style.height = '200%';
        this.shrink.appendChild(shrinkChild);
    
        element.appendChild(this.expand);
        element.appendChild(this.shrink);

        this.setScroll();
    
        let size = element.getBoundingClientRect();
    
        this.currentWidth = size.width;
        this.currentHeight = size.height;
    
        this.expand.addEventListener('scroll', this.onScroll);
        this.shrink.addEventListener('scroll', this.onScroll);
    }

    private setScroll = () => {
        const scrollPosition = 10000000;

        this.expand.scrollLeft = scrollPosition;
        this.expand.scrollTop = scrollPosition;
        this.shrink.scrollLeft = scrollPosition;
        this.shrink.scrollTop = scrollPosition;
    }

    private onScroll = () => {
        let size = this.element.getBoundingClientRect();
        let newWidth = size.width;
        let newHeight = size.height;

        if(newWidth != this.currentWidth || newHeight != this.currentHeight)
        {
            this.currentWidth = newWidth;
            this.currentHeight = newHeight;
            this.onResize();
        }

        this.setScroll();
    };
}