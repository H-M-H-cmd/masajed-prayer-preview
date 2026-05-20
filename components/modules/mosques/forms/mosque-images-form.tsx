"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/image-upload";
import { useLanguage } from "@/providers/language-provider";
import { mosqueImageService } from "@/services/mosque-image.service";
import { MosqueImage, MosqueImageCollection } from '@/types/mosque-image';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Internal } from "./partials/images/internal";
import { Exterior } from "./partials/images/exterior";
import { Gates } from "./partials/images/gates";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Bathrooms } from "./partials/images/bathrooms";
import { Others } from "./partials/images/others";

interface MosqueImagesFormProps {
    mosqueId: string;
    existingImages?: MosqueImage[];
    onChange?: (images: MosqueImage[]) => void;
    onFacilitiesUpdated?: () => void;
    hideCancelButton?: boolean;
}
interface MosqueResponse {
    id: number;
    code: string;
    name: string;
    type: string;
    related_to: string;
    images: MosqueImage[];
    // ... other mosque properties
}

// interface InternalImage {
//     position: string;
//     file: File;
//     url: string;
// }

export function MosqueImagesForm({ mosqueId, existingImages, onChange, onFacilitiesUpdated, hideCancelButton }: MosqueImagesFormProps) {
    const router = useRouter();
    const { t, language } = useLanguage();
    const [collections, setCollections] = React.useState<MosqueImageCollection[]>([]);
    const [isLoadingCollections, setIsLoadingCollections] = React.useState(true);
    const [images, setImages] = React.useState<MosqueImage[]>(existingImages || []);
    const [activeTab, setActiveTab] = React.useState<string>("");
    const [internalImages, setInternalImages] = React.useState<Record<string, string>>(() => {
        // Initialize from existing images
        const internal: Record<string, string> = {};
        existingImages?.forEach(img => {
            if (img.collection_name === 'interior_images' && img.custom_properties?.position) {
                internal[img.custom_properties.position] = img.original_url;
            }
        });
        return internal;
    });
    const [exteriorImages, setExteriorImages] = React.useState<Record<string, string>>(() => {
        const exterior: Record<string, string> = {};
        existingImages?.forEach(img => {
            if (img.collection_name === 'exterior_images' && img.custom_properties?.position) {
                exterior[img.custom_properties.position] = img.original_url;
            }
        });
        return exterior;
    });
    const [gatesImage, setGatesImage] = React.useState<Record<string, string>>(() => {
        const gates: Record<string, string> = {};
        existingImages?.forEach(img => {
            if (img.collection_name === 'gate_images' && img.custom_properties?.position) {
                gates[img.custom_properties.position] = img.original_url;
            }
        });
        return gates;
    });

    // Add state for delete confirmation
    const [deleteConfirmation, setDeleteConfirmation] = React.useState<{
        open: boolean;
        imageId?: string;
        position?: string;
        collection?: string;
    }>({
        open: false
    });

    // Remove the collections state since we'll upload immediately
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Add loading states for different sections
    const [loadingStates, setLoadingStates] = React.useState<{
        [key: string]: boolean;
    }>({});

    // Add state for tracking current collection index
    const [currentCollectionIndex, setCurrentCollectionIndex] = React.useState(0);

    // Helper to check if current tab is last tab
    const isLastCollection = currentCollectionIndex === collections.length - 1;

    // Helper function to set loading state
    const setLoading = (key: string, loading: boolean) => {
        setLoadingStates(prev => ({
            ...prev,
            [key]: loading
        }));
    };

    // Fetch only collections from backend
    React.useEffect(() => {
        const fetchCollections = async () => {
            try {
                const collectionsResponse = await mosqueImageService.getImageCollections();
                const initializedCollections = collectionsResponse.data.map(col => ({
                    collection: col.value,
                    images: [] as File[],
                }));

                setCollections(initializedCollections as unknown as MosqueImageCollection[]);
                // Set the first collection as active tab
                if (initializedCollections.length > 0) {
                    setActiveTab(initializedCollections[0].collection);
                }
            } catch (error) {
                toast.error(t('common.error'), {
                    description: (error as Error).message || t('mosques.form.imageCollectionsError')
                });
            } finally {
                setIsLoadingCollections(false);
            }
        };

        fetchCollections();
    }, [t]);

    // Update local images when existingImages prop changes
    React.useEffect(() => {
        if (existingImages) {
            setImages(existingImages);
            onChange?.(existingImages);
        }
    }, [existingImages, onChange]);

    const handleImagesChange = async (collectionName: string, files: File[]) => {
        setLoading(collectionName, true);
        try {
            const response = await mosqueImageService.uploadImages(mosqueId, {
                collection: collectionName,
                images: files.map(file => ({ image: file }))
            });

            if (response.data) {
                setImages(prev => [...prev, ...response.data]);
                onChange?.([...images, ...response.data]);

                toast.success(t('common.success'), {
                    description: t('mosques.form.imageUploaded')
                });
            }
        } catch (error) {
            toast.error(t('common.error'), {
                description: (error as Error).message || t('mosques.form.imageUploadError')
            });
        } finally {
            setLoading(collectionName, false);
        }
    };

    // Add effect to fetch existing images if not provided
    React.useEffect(() => {
        const fetchMosqueImages = async () => {
            if (!existingImages) {
                try {
                    const response = await mosqueImageService.getMosqueImages(mosqueId);
                    setImages(response.data);
                    onChange?.(response.data);
                } catch (error) {
                    toast.error(t('common.error'), {
                        description: (error as Error).message || t('mosques.form.imagesFetchError')
                    });
                }
            }
        };

        fetchMosqueImages();
    }, [mosqueId, existingImages, onChange, t]);

    const handleDeleteImage = async (imageId: string) => {
        try {
            await mosqueImageService.deleteImage(mosqueId, imageId);
            const newImages = images.filter(img => img.id !== imageId);
            setImages(newImages);
            onChange?.(newImages);

            toast.success(t('common.success'), {
                description: t('mosques.form.imageDeleted')
            });
        } catch (error) {
            toast.error(t('common.error'), {
                description: (error as Error).message || t('mosques.form.imageDeleteError')
            });
        }
    };

    // Update validateImages function
    const validateImages = (): boolean => {
        // Check if there are any images uploaded
        if (images.length === 0) {
            toast.error(t('common.error'), {
                description: t('mosques.form.imagesRequired')
            });
            return false;
        }

        // Check if at least one image exists in each required collection
        const requiredCollections = ['interior_images', 'exterior_images', 'gate_images'];
        const missingCollections = requiredCollections.filter(collection =>
            !images.some(img => img.collection_name === collection)
        );

        if (missingCollections.length > 0) {
            // Create a formatted string of missing collections
            const missingCollectionsText = missingCollections
                .map(c => t(`mosques.form.imageCollections.${c}`))
                .join(', ');

            toast.error(t('common.error'), {
                description: t('mosques.form.requiredImagesMessage').replace('{collections}', missingCollectionsText)
            });
            return false;
        }

        return true;
    };

    // Update handleNextCollection to include validation
    const handleNextCollection = () => {
        if (currentCollectionIndex < collections.length - 1) {
            const nextCollection = collections[currentCollectionIndex + 1];
            setCurrentCollectionIndex(prev => prev + 1);
            setActiveTab(nextCollection.collection);
        }
    };

    // Update handleFinish to include validation
    const handleFinish = async () => {
        try {
            setIsSubmitting(true);

            // Validate before proceeding
            if (!validateImages()) {
                setIsSubmitting(false);
                return;
            }

            onFacilitiesUpdated?.();
        } catch (error) {
            toast.error(t('common.error'), {
                description: (error as Error).message
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInternalImageUpload = async (position: string, file: File) => {
        setLoading(`interior_${position}`, true);
        try {
            const response = await mosqueImageService.uploadImages(mosqueId, {
                collection: 'interior_images',
                images: [{
                    image: file,
                    custom_properties: { position }
                }]
            });

            const mosqueResponse = response.data as unknown as MosqueResponse;
            const newImage = mosqueResponse.images?.find((img: MosqueImage) =>
                img.collection_name === 'interior_images' &&
                img.custom_properties?.position === position
            );

            if (newImage) {
                setInternalImages(prev => ({
                    ...prev,
                    [position]: newImage.original_url
                }));

                setImages(prev => [...prev, newImage]);
                onChange?.([...images, newImage]);

                toast.success(t('common.success'), {
                    description: t('mosques.form.imageUploaded')
                });
            }
        } catch (error) {
            toast.error(t('common.error'), {
                description: (error as Error).message || t('mosques.form.imageUploadError')
            });
        } finally {
            setLoading(`interior_${position}`, false);
        }
    };

    const handleInternalImageDelete = async (position: string) => {
        const imageToDelete = existingImages?.find(img =>
            img.collection_name === 'interior_images' &&
            img.custom_properties?.position === position
        );

        if (imageToDelete?.id) {
            setDeleteConfirmation({
                open: true,
                imageId: imageToDelete.id,
                position,
                collection: 'interior_images'
            });
        } else {
            // Handle non-uploaded image deletion
            setInternalImages(prev => {
                const newImages = { ...prev };
                delete newImages[position];
                return newImages;
            });
            const updatedImages = images.filter(img =>
                !(img.collection_name === 'interior_images' &&
                    img.custom_properties?.position === position)
            );
            setImages(updatedImages);
            onChange?.(updatedImages);
        }
    };

    const handleExteriorImageUpload = async (position: string, file: File) => {
        setLoading(`exterior_${position}`, true);
        try {
            const response = await mosqueImageService.uploadImages(mosqueId, {
                collection: 'exterior_images',
                images: [{
                    image: file,
                    custom_properties: { position }
                }]
            });

            const mosqueResponse = response.data as unknown as MosqueResponse;
            const newImage = mosqueResponse.images?.find((img: MosqueImage) =>
                img.collection_name === 'exterior_images' &&
                img.custom_properties?.position === position
            );

            if (newImage) {
                setExteriorImages(prev => ({
                    ...prev,
                    [position]: newImage.original_url
                }));

                setImages(prev => [...prev, newImage]);
                onChange?.([...images, newImage]);

                toast.success(t('common.success'), {
                    description: t('mosques.form.imageUploaded')
                });
            }
        } catch (error) {
            toast.error(t('common.error'), {
                description: (error as Error).message || t('mosques.form.imageUploadError')
            });
        } finally {
            setLoading(`exterior_${position}`, false);
        }
    };

    const handleExteriorImageDelete = async (position: string) => {
        const imageToDelete = existingImages?.find(img =>
            img.collection_name === 'exterior_images' &&
            img.custom_properties?.position === position
        );

        if (imageToDelete?.id) {
            setDeleteConfirmation({
                open: true,
                imageId: imageToDelete.id,
                position,
                collection: 'exterior_images'
            });
        } else {
            // Handle non-uploaded image deletion
            setExteriorImages(prev => {
                const newImages = { ...prev };
                delete newImages[position];
                return newImages;
            });
            const updatedImages = images.filter(img =>
                !(img.collection_name === 'exterior_images' &&
                    img.custom_properties?.position === position)
            );
            setImages(updatedImages);
            onChange?.(updatedImages);
        }
    };

    const handleGatesImageUpload = async (position: string, file: File) => {
        setLoading(`gates_${position}`, true);
        try {
            const response = await mosqueImageService.uploadImages(mosqueId, {
                collection: 'gate_images',
                images: [{
                    image: file,
                    custom_properties: { position }
                }]
            });

            const mosqueResponse = response.data as unknown as MosqueResponse;
            const newImage = mosqueResponse.images?.find((img: MosqueImage) =>
                img.collection_name === 'gate_images' &&
                img.custom_properties?.position === position
            );

            if (newImage) {
                setGatesImage(prev => ({
                    ...prev,
                    [position]: newImage.original_url
                }));

                setImages(prev => [...prev, newImage]);
                onChange?.([...images, newImage]);

                toast.success(t('common.success'), {
                    description: t('mosques.form.imageUploaded')
                });
            }
        } catch (error) {
            toast.error(t('common.error'), {
                description: (error as Error).message || t('mosques.form.imageUploadError')
            });
        } finally {
            setLoading(`gates_${position}`, false);
        }
    };

    const handleGatesImageDelete = async (position: string) => {
        const imageToDelete = existingImages?.find(img =>
            img.collection_name === 'gate_images' &&
            img.custom_properties?.position === position
        );

        if (imageToDelete?.id) {
            setDeleteConfirmation({
                open: true,
                imageId: imageToDelete.id,
                position,
                collection: 'gate_images'
            });
        } else {
            // Handle non-uploaded image deletion
            setGatesImage(prev => {
                const newImages = { ...prev };
                delete newImages[position];
                return newImages;
            });
            const updatedImages = images.filter(img =>
                !(img.collection_name === 'gate_images' &&
                    img.custom_properties?.position === position)
            );
            setImages(updatedImages);
            onChange?.(updatedImages);
        }
    };

    const handleBathroomImageUpload = async (section: string, file: File) => {
        setLoading(`bathroom_${section}`, true);
        try {
            const response = await mosqueImageService.uploadImages(mosqueId, {
                collection: 'bathroom_images',
                images: [{
                    image: file,
                    custom_properties: { section }
                }]
            });

            const mosqueResponse = response.data as unknown as MosqueResponse;
            setImages(mosqueResponse.images);
            onChange?.(mosqueResponse.images);
            toast.success(t('common.success'), {
                description: t('mosques.form.imageUploaded')
            });
        } catch (error) {
            toast.error(t('common.error'), {
                description: (error as Error).message || t('mosques.form.imageUploadError')
            });
        } finally {
            setLoading(`bathroom_${section}`, false);
        }
    };

    const handleBathroomImageDelete = async (section: string, imageUrl: string) => {
        const imageToDelete = images.find(img =>
            img.collection_name === 'bathroom_images' &&
            img.original_url === imageUrl &&
            img.custom_properties?.section === section
        );

        if (imageToDelete?.id) {
            setDeleteConfirmation({
                open: true,
                imageId: imageToDelete.id,
                position: section,
                collection: 'bathroom_images'
            });
        } else {
            // Handle non-uploaded image deletion
            const updatedImages = images.filter(img =>
                !(img.collection_name === 'bathroom_images' &&
                    img.original_url === imageUrl &&
                    img.custom_properties?.section === section)
            );
            setImages(updatedImages);
            onChange?.(updatedImages);
        }
    };

    const handleOtherImageUpload = async (section: string, file: File) => {
        setLoading(`other_${section}`, true);
        try {
            const response = await mosqueImageService.uploadImages(mosqueId, {
                collection: 'other_images',
                images: [{
                    image: file,
                    custom_properties: { section }
                }]
            });

            const mosqueResponse = response.data as unknown as MosqueResponse;
            setImages(mosqueResponse.images);
            onChange?.(mosqueResponse.images);

            toast.success(t('common.success'), {
                description: t('mosques.form.imageUploaded')
            });


        } catch (error) {
            toast.error(t('common.error'), {
                description: (error as Error).message || t('mosques.form.imageUploadError')
            });
        } finally {
            setLoading(`other_${section}`, false);
        }
    };

    const handleOtherImageDelete = async (section: string, imageUrl: string) => {
        const imageToDelete = images.find(img =>
            img.collection_name === 'other_images' &&
            img.original_url === imageUrl &&
            img.custom_properties?.section === section
        );

        if (imageToDelete?.id) {
            setDeleteConfirmation({
                open: true,
                imageId: imageToDelete.id,
                position: section,
                collection: 'other_images'
            });
        } else {
            // Handle non-uploaded image deletion
            const updatedImages = images.filter(img =>
                !(img.collection_name === 'other_images' &&
                    img.original_url === imageUrl &&
                    img.custom_properties?.section === section)
            );
            setImages(updatedImages);
            onChange?.(updatedImages);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirmation.imageId || !deleteConfirmation.position || !deleteConfirmation.collection) return;

        const { imageId, position, collection } = deleteConfirmation;

        try {
            await mosqueImageService.deleteImage(mosqueId, imageId);

            // Update UI state based on collection
            switch (collection) {
                case 'interior_images':
                    setInternalImages(prev => {
                        const newImages = { ...prev };
                        delete newImages[position];
                        return newImages;
                    });
                    break;
                case 'exterior_images':
                    setExteriorImages(prev => {
                        const newImages = { ...prev };
                        delete newImages[position];
                        return newImages;
                    });
                    break;
                case 'gate_images':
                    setGatesImage(prev => {
                        const newImages = { ...prev };
                        delete newImages[position];
                        return newImages;
                    });
                    break;
            }

            // Update images state
            const updatedImages = existingImages?.filter(img => img.id !== imageId) || [];
            setImages(updatedImages);
            onChange?.(updatedImages);

            toast.success(t('common.success'), {
                description: t('mosques.form.imageDeleted')
            });
        } catch (error) {
            toast.error(t('common.error'), {
                description: (error as Error).message || t('mosques.form.imageDeleteError')
            });
        } finally {
            setDeleteConfirmation({ open: false });
        }
    };

    if (isLoadingCollections) {
        return (
            <div className="flex items-center justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AlertDialog
                open={deleteConfirmation.open}
                onOpenChange={(open) => setDeleteConfirmation(prev => ({ ...prev, open }))}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('common.deleteConfirmation')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('mosques.form.deleteImageConfirmation')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex justify-center gap-4">
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t('common.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div>
                <Tabs dir={language === 'ar' ? 'rtl' : 'ltr'} value={activeTab} onValueChange={(value) => {
                    setActiveTab(value);
                    setCurrentCollectionIndex(collections.findIndex(c => c.collection === value));
                }}>
                    <TabsList className="w-full justify-start">
                        {collections.map((collection) => (
                            <TabsTrigger
                                key={collection.collection}
                                value={collection.collection}
                                className="flex-1"
                            >
                                {t(`mosques.form.imageCollections.${collection.collection}`)}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {collections.map((collection) => {
                        if (collection.collection === 'interior_images') {
                            return (
                                <TabsContent
                                    key={collection.collection}
                                    value={collection.collection}
                                    className="mt-6"
                                >
                                    <div className="space-y-4">

                                        <Internal
                                            images={internalImages}
                                            onImageUpload={handleInternalImageUpload}
                                            onImageDelete={handleInternalImageDelete}
                                            loadingStates={loadingStates}
                                        />
                                    </div>
                                </TabsContent>
                            );
                        }

                        if (collection.collection === 'exterior_images') {
                            return (
                                <TabsContent
                                    key={collection.collection}
                                    value={collection.collection}
                                    className="mt-6"
                                >
                                    <div className="my-8">

                                        <Exterior
                                            images={exteriorImages}
                                            onImageUpload={handleExteriorImageUpload}
                                            onImageDelete={handleExteriorImageDelete}
                                            loadingStates={loadingStates}
                                        />
                                    </div>
                                </TabsContent>
                            );
                        }

                        if (collection.collection === 'gate_images') {
                            return (
                                <TabsContent
                                    key={collection.collection}
                                    value={collection.collection}
                                    className="mt-6"
                                >
                                    <Gates
                                        images={gatesImage}
                                        onImageUpload={handleGatesImageUpload}
                                        onImageDelete={handleGatesImageDelete}
                                    />
                                </TabsContent>
                            );
                        }

                        if (collection.collection === 'bathroom_images') {
                            return (
                                <TabsContent
                                    key={collection.collection}
                                    value={collection.collection}
                                    className="mt-6"
                                >
                                    <Bathrooms
                                        images={images
                                            .filter(img => img.collection_name === 'bathroom_images')
                                            .reduce((acc, img) => ({
                                                ...acc,
                                                [img.original_url]: {
                                                    url: img.original_url,
                                                    custom_properties: img.custom_properties
                                                }
                                            }), {})}
                                        onImageUpload={handleBathroomImageUpload}
                                        onImageDelete={handleBathroomImageDelete}
                                    />
                                </TabsContent>
                            );
                        }

                        if (collection.collection === 'other_images') {
                            return (
                                <TabsContent
                                    key={collection.collection}
                                    value={collection.collection}
                                    className="mt-6"
                                >
                                    <Others
                                        images={images
                                            .filter(img => img.collection_name === 'other_images')
                                            .reduce((acc, img) => ({
                                                ...acc,
                                                [img.original_url]: {
                                                    url: img.original_url,
                                                    custom_properties: img.custom_properties
                                                }
                                            }), {})}
                                        onImageUpload={handleOtherImageUpload}
                                        onImageDelete={handleOtherImageDelete}
                                    />
                                </TabsContent>
                            );
                        }

                        const existingCollectionImages = images.filter(
                            img => img.collection_name === collection.collection
                        );

                        return (
                            <TabsContent
                                key={collection.collection}
                                value={collection.collection}
                                className="mt-6"
                            >
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">
                                        {t(`mosques.form.imageCollections.${collection.collection}`)}
                                    </h3>
                                    <ImageUpload
                                        value={
                                            collection.images.length > 0
                                                ? collection.images.map(img => typeof img === 'string' ? img : URL.createObjectURL(img.image))
                                                : existingCollectionImages.map(img => img.original_url)
                                        }
                                        onChange={(files) => handleImagesChange(collection.collection, files)}
                                        maxFiles={collection.collection === 'gate_images' ? 1 : 5}
                                        maxSize={5}
                                        disabled={isSubmitting}
                                        onDelete={async (url) => {
                                            const image = existingCollectionImages.find(img => img.original_url === url);
                                            if (image) {
                                                await handleDeleteImage(image.id);
                                            }
                                        }}
                                    />
                                </div>
                            </TabsContent>
                        );
                    })}
                </Tabs>
            </div>

            <div className={`flex  ${hideCancelButton ? 'justify-end' : 'justify-between'}`}>
                {!hideCancelButton && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/dashboard/mosques")}
                        disabled={isSubmitting}
                    >
                        {t('common.cancel')}
                    </Button>
                )}

                <div className="flex gap-2">
                    {isLastCollection ??
                        (
                            <Button
                                onClick={handleFinish}
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('common.finish')}
                            </Button>
                        )
                    }
                    {!isLastCollection && !hideCancelButton && (
                        <Button
                            onClick={handleNextCollection}
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('common.next')}
                        </Button>
                    ) }
                    {!isLastCollection && hideCancelButton && (
                        <Button
                        onClick={handleNextCollection}
                        disabled={isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('common.next')}
                    </Button>
                    ) }
                </div>
            </div>
        </div>
    );
} 