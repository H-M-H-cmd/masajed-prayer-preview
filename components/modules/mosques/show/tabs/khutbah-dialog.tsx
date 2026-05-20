import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KhutbahRecording } from "@/types/khateeb";
import { useLanguage } from "@/providers/language-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface KhutbahDialogProps {
  khutbah: KhutbahRecording | null;
  onClose: () => void;
}

export function KhutbahDialog({ khutbah, onClose }: KhutbahDialogProps) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = React.useState<'video' | 'transcript'>('video');

  if (!khutbah) return null;

  return (
    <Dialog open={!!khutbah} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{khutbah.title}</DialogTitle>
          <DialogDescription>
            {khutbah.khateeb_name} - {new Date(khutbah.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'video' | 'transcript')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="video">{t('smartKhateeb.actions.viewVideo')}</TabsTrigger>
            <TabsTrigger value="transcript">{t('smartKhateeb.actions.downloadTranscript')}</TabsTrigger>
          </TabsList>
          <TabsContent value="video" className="h-[calc(80vh-12rem)]">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                src={khutbah.video_url}
                controls
                className="w-full h-full"
              />
            </div>
          </TabsContent>
          <TabsContent value="transcript" className="h-[calc(80vh-12rem)]">
            <ScrollArea className="h-full rounded-md border p-4">
              {khutbah.status === 'completed' ? (
                <iframe
                  src={khutbah.transcript_url}
                  className="w-full h-full"
                  title="transcript"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    {t('smartKhateeb.messages.processingTranscript')}
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 