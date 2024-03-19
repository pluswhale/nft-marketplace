import {RootState} from "../store";

export const activeModalSelector = (state: RootState) => {
    return state.modal.activeModals;
}