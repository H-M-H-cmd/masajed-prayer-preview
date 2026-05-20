"use client";

import * as React from "react";
import { useLanguage } from "@/providers/language-provider";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { prayerOrderService } from "@/services/v-2/prayer/issues.service";

import { ImageUpload } from "@/components/ui/image-upload";
import { 
  Loader2, 
  Plus, 
  Trash, 
  ArrowLeft,
  ImageIcon,
  FileText,
  ListPlus,
} from "lucide-react";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { assetService, Asset } from "@/services/asset.service";
import { ComboboxSelect } from "@/components/ui/combobox-select";

interface OrderItem {
  product_id: string;
  quantity: number;
  images: (File | string)[];
}

interface OrderForm {
  title: string;
  description: string;
  mosque_id: string;
  images: (File | string)[];
  items: OrderItem[];
}

type ApiError = {
  message: string;
  [key: string]: unknown;
};

export default function CreateIssuePage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [form, setForm] = React.useState<OrderForm>({
    title: "",
    description: "",
    mosque_id: "1", // Hardcoded for now
    images: [],
    items: [{ product_id: "", quantity: 1, images: [] }],
  });

  // Store all fetched assets
  const [allAssets, setAllAssets] = React.useState<Asset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = React.useState(true);

  // Fetch all assets at once
  React.useEffect(() => {
    const fetchAllAssets = async () => {
      try {
        setIsLoadingAssets(true);
        const response = await assetService.getAssets({ per_page: 1000 });
        setAllAssets(response.data.data);
      } catch (error) {
        showToast.error((error as ApiError).message);
      } finally {
        setIsLoadingAssets(false);
      }
    };

    fetchAllAssets();
  }, []); // Only run once on mount

  // Format assets for ComboboxSelect
  const formattedAssets = React.useMemo(() => {
    return allAssets.map(asset => ({
      id: asset.id,
      name: language === 'ar' ? asset.name_ar : asset.name,
      // Include both names for search
      searchText: `${asset.name} ${asset.name_ar}`
    }));
  }, [allAssets, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert File objects to base64 strings
      const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
      };

      // Convert all images to base64
      const processImages = async (images: (File | string)[]): Promise<string[]> => {
        return Promise.all(
          images.map(async (image) => {
            if (image instanceof File) {
              return await convertFileToBase64(image);
            }
            return image;
          })
        );
      };

      // Process form data
      const processedForm = {
        ...form,
        images: await processImages(form.images),
        items: await Promise.all(
          form.items.map(async (item) => ({
            ...item,
            images: await processImages(item.images)
          }))
        )
      };

      await prayerOrderService.createOrder(processedForm);
      showToast.success(t('common.success'));
      router.push('/issues');
    } catch (error) {
      const apiError = error as ApiError;
      showToast.error(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { product_id: "", quantity: 1, images: [] }]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: unknown) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className={cn(
        "flex items-center gap-4",
      )}>
        <Link href="/issues">
          <Button 
            variant="ghost" 
            size="icon"
            className={cn(language === 'ar' && "rotate-180")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Details Card */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className={cn(
              "flex items-center gap-2 text-primary",
            )}>
              <FileText className="h-5 w-5" />
              <h2 className="font-medium">{t('prayer.issues.requestDetails')}</h2>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-start">
                  {t('prayer.issues.details')}
                </Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t('prayer.issues.details')}
                  required
                  className="text-start"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-start">
                  {t('prayer.issues.description')}
                </Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('prayer.issues.description')}
                  required
                  className="min-h-[100px] text-start"
                />
              </div>

              {/* Main Images */}
              <div className="space-y-2">
                <div className={cn(
                  "flex items-center gap-2",
                )}>
                  <ImageIcon className="h-4 w-4 text-primary" />
                  <Label className="text-start">{t('prayer.issues.attachments')}</Label>
                </div>
                <ImageUpload
                  value={form.images}
                  onChange={(urls) => setForm(prev => ({ ...prev, images: urls }))}
                  maxFiles={5}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Items Card */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className={cn(
              "flex items-center justify-between",
            )}>
              <div className={cn(
                "flex items-center gap-2 text-primary",
              )}>
                <ListPlus className="h-5 w-5" />
                <h2 className="font-medium">{t('prayer.issues.items')}</h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className={cn(
                  "gap-1",
                )}
              >
                <Plus className="h-4 w-4" />
                {t('prayer.issues.addItem')}
              </Button>
            </div>

            <div className="space-y-4">
              {form.items.map((item, index) => (
                <Card key={index} className="p-4 space-y-4">
                  <div className={cn(
                    "flex items-start justify-between",
                  )}>
                    <div className="space-y-4 flex-1">
                      {/* Product Selection */}
                      <div className="space-y-2">
                        <Label className="text-start">{t('prayer.issues.productId')}</Label>
                        <ComboboxSelect
                          value={parseInt(item.product_id) || undefined}
                          onValueChange={(value) => updateItem(index, 'product_id', value.toString())}
                          items={formattedAssets}
                          placeholder={t('prayer.issues.selectProduct')}
                          isLoading={isLoadingAssets}
                          searchPlaceholder={t('common.search')}
                          noResultsText={t('common.noResults')}
                          loadingText={t('common.loading')}
                        />
                      </div>

                      {/* Quantity */}
                      <div className="space-y-2">
                        <Label className="text-start">{t('prayer.issues.quantity')}</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                          required
                          className="text-start"
                        />
                      </div>

                      {/* Item Images */}
                      <div className="space-y-2">
                        <Label className="text-start">{t('prayer.issues.itemImages')}</Label>
                        <ImageUpload
                          value={item.images}
                          onChange={(urls) => updateItem(index, 'images', urls)}
                          maxFiles={3}
                        />
                      </div>
                    </div>

                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        className="text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className={cn(
          "flex justify-end gap-4",
        )}>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className={cn(
              "gap-2",
            )}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('prayer.issues.submit')}
          </Button>
        </div>
      </form>
    </div>
  );
} 