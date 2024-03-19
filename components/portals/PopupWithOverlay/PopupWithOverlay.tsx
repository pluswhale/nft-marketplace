import {FC, ReactElement} from "react";
import { Portal } from "../Portal/Portal";

import style from "./Popup.module.scss";

type Props = {
  children: ReactElement;
  onClose: Function;
  isOpened: boolean;
};

export const PopupWithOverlay: FC<Props> = ({ children, onClose, isOpened }) => {
  if (!isOpened) return null;
  return (
    <Portal>
      <div className={style.container} role="dialog">
        <div className={style.overlay} role="button" onClick={() => onClose()} />
        <div className={style.content}>{children}</div>
      </div>
    </Portal>
  );
};
