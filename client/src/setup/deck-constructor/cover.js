import {
  dragEnd,
  dragLeave,
  dragOver,
  dragStart,
  drop,
} from '../../setup/image-logic/drag.js';
import {
  coverClick,
  openCardContextMenu,
} from '../image-logic/click-events.js';
import { resetImage } from '../image-logic/reset-image.js';
import {
  handleCardHoverStart,
  handleCardHoverEnd,
  handleCardHoverMove,
} from '../image-logic/hover-preview.js';

export class Cover {
  user;
  image;

  constructor(user, id, imageURL) {
    this.user = user;
    this.imageAttributes = {
      user: user,
      id: id,
      src: imageURL,
      alt: id,
      draggable: true,
      click: coverClick,
      dragstart: dragStart,
      dragover: dragOver,
      dragleave: dragLeave,
      dragend: dragEnd,
      drop: drop,
      contextmenu: openCardContextMenu,
      mouseenter: handleCardHoverStart,
      mouseleave: handleCardHoverEnd,
      mousemove: handleCardHoverMove,
    };
    this.buildImage(this.imageAttributes);
  }

  buildImage(imageAttributes) {
    this.image = new Image();
    for (const attr in imageAttributes) {
      if (typeof imageAttributes[attr] === 'function') {
        this.image.addEventListener(attr, imageAttributes[attr]);
      } else if (attr === 'user') {
        this.image.user = imageAttributes[attr];
      } else {
        this.image.setAttribute(attr, imageAttributes[attr]);
      }
    }
    resetImage(this.image);
  }
}
