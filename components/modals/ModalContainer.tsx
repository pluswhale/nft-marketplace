// import {shallowEqual, useSelector} from 'react-redux';
// import {useAppDispatch} from "redux/store";
// import {activeModalSelector} from "../../redux/selectors/modalSelectors";
// import CreateNft from "./CreateNFT";
// import {deleteLastModal, deleteModal} from "../../redux/slices/modal";
// import {PopupWithOverlay} from "../portals/PopupWithOverlay/PopupWithOverlay";
// import {ReactElement} from "react";
//
//
// const modalList = [
//     { id: 1, name: 'create-nft', element: <CreateNft /> },
// ];
//
// const ModalContainer = () => {
//     const dispatch = useAppDispatch();
//
//     const activeModals = useSelector(activeModalSelector, shallowEqual);
//
//     const handleCloseModal = () => {
//         dispatch(deleteLastModal());
//     };
//
//     const displayingModals = () => {
//
//              const activeModalComponents = activeModals.map((activeModal) => {
//                  return modalList
//                      .map((modal) => activeModal.id === modal.id ? modal.element:null )
//                      .filter((modal) => modal)
//              });
//
//             return (
//                 <PopupWithOverlay onClose={handleCloseModal} isOpened={Boolean(modal.id)}>
//                     {activeModalComponents}
//                 </PopupWithOverlay>
//             );
//
//
//     }
//
//     return (
//         <>
//             {displayingModals()}
//         </>
//     );
// };
// export default ModalContainer;