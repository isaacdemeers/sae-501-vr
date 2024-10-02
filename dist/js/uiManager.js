import {
    addScenesFromAssets,
    switchScene,
    updateSceneSelect,
    openSceneManagementModal,
    exportProjectData,
    importProjectData,
    scenes, // Importation de la liste des scènes
} from './sceneManager.js';
import {
    startPlacingTag,
    handleSkyClickForTag,
    cancelPlacingTag,
    confirmTextPlacement,
    confirmMediaSelection,
} from './tagManager.js';

export let assetsEl;
export let skyEl;
export let sceneEl;
export let cameraEl;

let renameCallback = null;
let deleteCallback = null;
let textEditCallback = null;

let imageDeleteCallback = null;
let mediaDeleteCallback = null;

let selectedImages = [];
let selectedMedia = null;

export const initializeUI = () => {
    assetsEl = document.querySelector('#assets');
    skyEl = document.querySelector('#sky');
    sceneEl = document.querySelector('a-scene');
    cameraEl = document.querySelector('#camera');

    updateTagButtonsState(); // Initialisation de l'état des boutons des tags
};

export const showNotification = (message, type = 'info') => {
    const notificationEl = document.getElementById('notification');
    notificationEl.textContent = message;
    notificationEl.style.display = message ? 'block' : 'none';
    notificationEl.style.backgroundColor =
        type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007BFF';

    if (message) {
        setTimeout(() => {
            notificationEl.style.display = 'none';
        }, 3000);
    }
};

export const setupEventListeners = () => {
    document.getElementById('addScenesButton').addEventListener('click', () => {
        openImageSelectionModal();
    });

    document
        .getElementById('confirmImageSelectionButton')
        .addEventListener('click', () => {
            addScenesFromAssets(selectedImages);
            selectedImages = [];
            document.getElementById('imageSelectionModal').style.display = 'none';
        });

    document
        .getElementById('cancelImageSelectionButton')
        .addEventListener('click', () => {
            selectedImages = [];
            document.getElementById('imageSelectionModal').style.display = 'none';
        });

    document.getElementById('openUploadImagesModalButton').addEventListener('click', () => {
        document.getElementById('imageUploadInput').value = '';
        document.getElementById('uploadImagesModal').style.display = 'flex';
    });

    document.getElementById('uploadImagesButton').addEventListener('click', () => {
        const files = document.getElementById('imageUploadInput').files;
        if (files.length === 0) {
            showNotification('No files selected.', 'error');
            return;
        }
        uploadImages(files);
    });

    document.getElementById('cancelUploadImagesButton').addEventListener('click', () => {
        document.getElementById('uploadImagesModal').style.display = 'none';
    });

    document.getElementById('addDoorButton').addEventListener('click', () => {
        startPlacingTag('door');
    });

    document.getElementById('addTextButton').addEventListener('click', () => {
        startPlacingTag('text');
    });

    document.getElementById('addImageButton').addEventListener('click', () => {
        startPlacingTag('image');
    });

    document.getElementById('addVideoButton').addEventListener('click', () => {
        startPlacingTag('video');
    });

    skyEl.addEventListener('click', (event) => {
        handleSkyClickForTag(event);
    });

    document
        .getElementById('cancelDoorPlacementButton')
        .addEventListener('click', () => {
            cancelPlacingTag();
            document.getElementById('doorPlacementModal').style.display = 'none';
        });

    document
        .getElementById('confirmTextPlacementButton')
        .addEventListener('click', () => {
            confirmTextPlacement();
        });

    document
        .getElementById('cancelTextPlacementButton')
        .addEventListener('click', () => {
            cancelPlacingTag();
            document.getElementById('textPlacementModal').style.display = 'none';
        });

    document
        .getElementById('confirmMediaSelectionButton')
        .addEventListener('click', () => {
            confirmMediaSelection(selectedMedia);
        });

    document
        .getElementById('cancelMediaSelectionButton')
        .addEventListener('click', () => {
            cancelPlacingTag();
            document.getElementById('mediaSelectionModal').style.display = 'none';
        });

    document.getElementById('openUploadMediaModalButton').addEventListener('click', () => {
        document.getElementById('mediaUploadInput').value = '';
        document.getElementById('uploadMediaModal').style.display = 'flex';
    });

    document.getElementById('uploadMediaButton').addEventListener('click', () => {
        const files = document.getElementById('mediaUploadInput').files;
        if (files.length === 0) {
            showNotification('No files selected.', 'error');
            return;
        }
        uploadMedia(files);
    });

    document.getElementById('cancelUploadMediaButton').addEventListener('click', () => {
        document.getElementById('uploadMediaModal').style.display = 'none';
    });

    const sceneSelect = document.getElementById('sceneSelect');
    sceneSelect.addEventListener('change', () => {
        const selectedSceneId = sceneSelect.value;
        switchScene(selectedSceneId);
    });

    document
        .getElementById('manageScenesButton')
        .addEventListener('click', () => {
            openSceneManagementModal();
        });

    document
        .getElementById('closeSceneManagementButton')
        .addEventListener('click', () => {
            document.getElementById('sceneManagementModal').style.display = 'none';
        });

    document
        .getElementById('exportProjectButton')
        .addEventListener('click', () => {
            const projectData = exportProjectData();
            downloadJSON(projectData, 'project.json');
        });

    document
        .getElementById('importProjectButton')
        .addEventListener('click', () => {
            document.getElementById('importProjectInput').click();
        });

    document
        .getElementById('importProjectInput')
        .addEventListener('change', handleProjectImport);

    document.getElementById('confirmRenameButton').addEventListener('click', () => {
        if (renameCallback) {
            const newName = document.getElementById('renameInput').value.trim();
            renameCallback(newName);
            renameCallback = null;
            document.getElementById('renameModal').style.display = 'none';
        }
    });

    document.getElementById('cancelRenameButton').addEventListener('click', () => {
        renameCallback = null;
        document.getElementById('renameModal').style.display = 'none';
    });

    document.getElementById('confirmDeleteButton').addEventListener('click', () => {
        if (deleteCallback) {
            deleteCallback();
            deleteCallback = null;
            document.getElementById('confirmDeleteModal').style.display = 'none';
        }
    });

    document.getElementById('cancelDeleteButton').addEventListener('click', () => {
        deleteCallback = null;
        document.getElementById('confirmDeleteModal').style.display = 'none';
    });

    document
        .getElementById('confirmImageDeleteButton')
        .addEventListener('click', () => {
            if (imageDeleteCallback) {
                imageDeleteCallback();
                imageDeleteCallback = null;
                document.getElementById('confirmImageDeleteModal').style.display = 'none';
            }
        });

    document
        .getElementById('cancelImageDeleteButton')
        .addEventListener('click', () => {
            imageDeleteCallback = null;
            document.getElementById('confirmImageDeleteModal').style.display = 'none';
        });

    document
        .getElementById('confirmMediaDeleteButton')
        .addEventListener('click', () => {
            if (mediaDeleteCallback) {
                mediaDeleteCallback();
                mediaDeleteCallback = null;
                document.getElementById('confirmMediaDeleteModal').style.display = 'none';
            }
        });

    document
        .getElementById('cancelMediaDeleteButton')
        .addEventListener('click', () => {
            mediaDeleteCallback = null;
            document.getElementById('confirmMediaDeleteModal').style.display = 'none';
        });

    document.getElementById('confirmTextEditButton').addEventListener('click', () => {
        if (textEditCallback) {
            const newContent = document.getElementById('textEditInput').value.trim();
            textEditCallback(newContent);
            textEditCallback = null;
            document.getElementById('textEditModal').style.display = 'none';
        }
    });

    document.getElementById('cancelTextEditButton').addEventListener('click', () => {
        textEditCallback = null;
        document.getElementById('textEditModal').style.display = 'none';
    });
};

const openImageSelectionModal = () => {
    fetch('/imagelist')
        .then((response) => response.json())
        .then((imageList) => {
            const imageGrid = document.getElementById('imageGrid');
            imageGrid.innerHTML = '';
            selectedImages = [];

            imageList.forEach((imageName) => {
                const imageItem = document.createElement('div');
                imageItem.classList.add('image-item');

                const imgEl = document.createElement('img');
                imgEl.src = `assets/${encodeURIComponent(imageName)}`;
                imgEl.alt = imageName;

                const deleteIcon = document.createElement('span');
                deleteIcon.classList.add('delete-icon');
                deleteIcon.innerHTML = '&times;';
                deleteIcon.title = 'Delete Image';

                deleteIcon.addEventListener('click', (event) => {
                    event.stopPropagation();
                    openConfirmImageDeleteModal(imageName, imageItem);
                });

                imageItem.appendChild(deleteIcon);
                imageItem.appendChild(imgEl);
                imageGrid.appendChild(imageItem);

                imageItem.addEventListener('click', () => {
                    if (selectedImages.includes(imageName)) {
                        selectedImages = selectedImages.filter((name) => name !== imageName);
                        imageItem.classList.remove('selected');
                    } else {
                        selectedImages.push(imageName);
                        imageItem.classList.add('selected');
                    }
                });
            });

            document.getElementById('imageSelectionModal').style.display = 'flex';
        })
        .catch((error) => {
            console.error('Error fetching image list:', error);
            showNotification('Failed to load images.', 'error');
        });
};

const uploadImages = (files) => {
    const formData = new FormData();
    for (const file of files) {
        formData.append('images', file);
    }

    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                showNotification(data.error, 'error');
            } else {
                showNotification('Images uploaded successfully.', 'success');
                document.getElementById('uploadImagesModal').style.display = 'none';
                openImageSelectionModal();
            }
        })
        .catch((error) => {
            console.error('Error uploading images:', error);
            showNotification('Failed to upload images.', 'error');
        });
};

export const openMediaSelectionModal = () => {
    fetch('/medialist')
        .then((response) => response.json())
        .then((mediaList) => {
            const mediaGrid = document.getElementById('mediaGrid');
            mediaGrid.innerHTML = '';
            selectedMedia = null;

            mediaList.forEach((mediaName) => {
                const mediaItem = document.createElement('div');
                mediaItem.classList.add('image-item');

                const isVideo = /\.(mp4|webm|ogg)$/.test(mediaName.toLowerCase());

                let mediaEl;
                if (isVideo) {
                    mediaEl = document.createElement('video');
                    mediaEl.src = `assets/${encodeURIComponent(mediaName)}`;
                    mediaEl.alt = mediaName;
                    mediaEl.width = 100;
                    mediaEl.height = 100;
                    mediaEl.muted = true;
                    mediaEl.loop = true;
                    mediaEl.play();
                } else {
                    mediaEl = document.createElement('img');
                    mediaEl.src = `assets/${encodeURIComponent(mediaName)}`;
                    mediaEl.alt = mediaName;
                }

                const deleteIcon = document.createElement('span');
                deleteIcon.classList.add('delete-icon');
                deleteIcon.innerHTML = '&times;';
                deleteIcon.title = 'Delete Media';

                deleteIcon.addEventListener('click', (event) => {
                    event.stopPropagation();
                    openConfirmMediaDeleteModal(mediaName, mediaItem);
                });

                mediaItem.appendChild(deleteIcon);
                mediaItem.appendChild(mediaEl);
                mediaGrid.appendChild(mediaItem);

                mediaItem.addEventListener('click', () => {
                    selectedMedia = mediaName;
                    Array.from(mediaGrid.children).forEach((child) => child.classList.remove('selected'));
                    mediaItem.classList.add('selected');
                });
            });

            document.getElementById('mediaSelectionModal').style.display = 'flex';
        })
        .catch((error) => {
            console.error('Error fetching media list:', error);
            showNotification('Failed to load media.', 'error');
        });
};

const uploadMedia = (files) => {
    const formData = new FormData();
    for (const file of files) {
        formData.append('media', file);
    }

    fetch('/uploadmedia', {
        method: 'POST',
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                showNotification(data.error, 'error');
            } else {
                showNotification('Media uploaded successfully.', 'success');
                document.getElementById('uploadMediaModal').style.display = 'none';
                openMediaSelectionModal();
            }
        })
        .catch((error) => {
            console.error('Error uploading media:', error);
            showNotification('Failed to upload media.', 'error');
        });
};

const openConfirmImageDeleteModal = (imageName, imageItem) => {
    document.getElementById('confirmImageDeleteMessage').textContent = `Are you sure you want to delete the image "${imageName}"?`;
    imageDeleteCallback = () => {
        deleteImage(imageName, imageItem);
    };
    document.getElementById('confirmImageDeleteModal').style.display = 'flex';
};

const deleteImage = (imageName, imageItem) => {
    fetch(`/deleteimage`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageName }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                showNotification(data.error, 'error');
            } else {
                showNotification('Image deleted successfully.', 'success');
                imageItem.remove();

                selectedImages = selectedImages.filter((name) => name !== imageName);
            }
        })
        .catch((error) => {
            console.error('Error deleting image:', error);
            showNotification('Failed to delete image.', 'error');
        });
};

const openConfirmMediaDeleteModal = (mediaName, mediaItem) => {
    document.getElementById('confirmMediaDeleteMessage').textContent = `Are you sure you want to delete the media "${mediaName}"?`;
    mediaDeleteCallback = () => {
        deleteMedia(mediaName, mediaItem);
    };
    document.getElementById('confirmMediaDeleteModal').style.display = 'flex';
};

const deleteMedia = (mediaName, mediaItem) => {
    fetch(`/deletemedia`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mediaName }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                showNotification(data.error, 'error');
            } else {
                showNotification('Media deleted successfully.', 'success');
                mediaItem.remove();

                if (selectedMedia === mediaName) {
                    selectedMedia = null;
                }
            }
        })
        .catch((error) => {
            console.error('Error deleting media:', error);
            showNotification('Failed to delete media.', 'error');
        });
};

export const updateTagButtonsState = () => {
    const hasScenes = scenes.length > 0;
    const tagButtons = [
        document.getElementById('addDoorButton'),
        document.getElementById('addTextButton'),
        document.getElementById('addImageButton'),
        document.getElementById('addVideoButton'),
    ];
    tagButtons.forEach((button) => {
        if (hasScenes) {
            button.disabled = false;
        } else {
            button.disabled = true;
        }
    });
};

const downloadJSON = (data, filename) => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
};

const handleProjectImport = (event) => {
    const file = event.target.files[0];
    if (!file) {
        showNotification('No file selected.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const projectData = JSON.parse(e.target.result);
            importProjectData(projectData);
            showNotification('Project imported successfully.', 'success');
        } catch (err) {
            console.error('Error parsing project file:', err);
            showNotification('Failed to import project.', 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
};

export const createListItem = (data, type, actions) => {
    const li = document.createElement('li');
    const content = document.createElement('div');
    const buttonsDiv = document.createElement('div');
    const text = document.createElement('p');

    li.classList.add('cat__list__item');

    content.classList.add('cat__list__item__content');

    buttonsDiv.classList.add('cat__list__item__content__buttons');

    text.classList.add('cat__list__item__content__title');
    text.textContent = data.name;

    if (actions.onRename) {
        const renameBtn = document.createElement('button');
        const renameIcon = document.createElement('img');

        renameBtn.classList.add('button', 'button--square');

        renameBtn.addEventListener('click', () => {
            actions.onRename();
        });

        renameIcon.src = './assets/icons/photo-edit.svg';
        renameIcon.alt = 'rename button';
        renameIcon.classList.add('button__icon', 'button__icon--small');

        renameBtn.appendChild(renameIcon);
        buttonsDiv.appendChild(renameBtn);
    }

    if (actions.onEditContent && data.type === 'text') {
        const editBtn = document.createElement('button');
        const editIcon = document.createElement('img');

        editBtn.classList.add('button', 'button--square');

        editBtn.addEventListener('click', () => {
            actions.onEditContent();
        });

        editIcon.src = './assets/icons/edit.svg'; // Assurez-vous que cette icône existe dans vos assets
        editIcon.alt = 'edit content button';
        editIcon.classList.add('button__icon', 'button__icon--small');

        editBtn.appendChild(editIcon);
        buttonsDiv.appendChild(editBtn);
    }

    if (actions.onDelete) {
        const deleteBtn = document.createElement('button');
        const deleteIcon = document.createElement('img');

        deleteBtn.classList.add('button', 'button--square');
        deleteBtn.addEventListener('click', () => {
            actions.onDelete();
        });

        deleteIcon.src = './assets/icons/trash.svg';
        deleteIcon.alt = 'delete button';
        deleteIcon.classList.add('button__icon', 'button__icon--small');

        deleteBtn.appendChild(deleteIcon);
        buttonsDiv.appendChild(deleteBtn);
    }

    if (type === 'tag' && data.type === 'door' && actions.onDestinationChange) {
        const destinationSelect = document.createElement('select');
        const img = document.createElement('img');

        destinationSelect.classList.add('cat__list__item__select');

        img.src = './assets/icons/corner-down-right.svg';
        img.classList.add('button__icon');

        actions.destinationOptions.forEach((scene) => {
            const option = document.createElement('option');
            option.value = scene.id;
            option.textContent = scene.name;
            if (scene.id === data.destinationSceneId) {
                option.selected = true;
            }
            destinationSelect.appendChild(option);
        });

        destinationSelect.addEventListener('change', () => {
            const newDestinationSceneId = destinationSelect.value;
            actions.onDestinationChange(newDestinationSceneId);
        });

        const destinationSelectBox = document.createElement('div');
        const destinationSelectText = document.createElement('p');

        destinationSelectText.textContent = 'To';
        destinationSelectText.classList.add('cat__list__item__select__title');

        destinationSelectBox.classList.add('cat__list__item__select__box');
        destinationSelectBox.appendChild(img);

        destinationSelectBox.appendChild(destinationSelectText);
        destinationSelectBox.appendChild(destinationSelect);

        content.appendChild(text);
        content.appendChild(buttonsDiv);
        li.appendChild(content);
        li.appendChild(destinationSelectBox);
    } else {
        content.appendChild(text);
        content.appendChild(buttonsDiv);
        li.appendChild(content);
    }

    return li;
};

export const openTextEditModal = (currentContent, callback) => {
    document.getElementById('textEditInput').value = currentContent;
    textEditCallback = callback;
    document.getElementById('textEditModal').style.display = 'flex';
};

export const openRenameModal = (title, currentName, callback) => {
    document.getElementById('renameModalTitle').textContent = title;
    document.getElementById('renameInput').value = currentName;
    renameCallback = callback;
    document.getElementById('renameModal').style.display = 'flex';
};

export const openConfirmDeleteModal = (title, message, callback) => {
    document.getElementById('confirmDeleteModalTitle').textContent = title;
    document.getElementById('confirmDeleteMessage').textContent = message;
    deleteCallback = callback;
    document.getElementById('confirmDeleteModal').style.display = 'flex';
};
