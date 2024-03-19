export type InitialState = {
    activeModals: Modal[],
}

export type Modal = {
    id: number,
    name: string,
    isOverlay: boolean,
    isCloseByClickOutside: boolean,
}

