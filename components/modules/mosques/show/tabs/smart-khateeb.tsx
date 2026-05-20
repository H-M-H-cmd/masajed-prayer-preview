"use client";

import * as React from "react";
import { useLanguage } from "@/providers/language-provider";
import { useApi } from "@/hooks/use-api";
import { khateebService } from "@/services/khateeb.service";
import { KhutbahRecording, KhutbahFilter } from "@/types/khateeb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/DatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, FileText, Play, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import { KhutbahDialog } from "./khutbah-dialog";

interface SmartKhateebTabProps {
  mosqueId: string;
}

export function SmartKhateebTab({ mosqueId }: SmartKhateebTabProps) {
  const { t, language } = useLanguage();
  const [filter, setFilter] = React.useState<KhutbahFilter>({});
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedKhutbah, setSelectedKhutbah] = React.useState<KhutbahRecording | null>(null);

  const { 
    data: khutbahsData,
    execute: fetchKhutbahs,
    // isLoading
  } = useApi(() => 
    khateebService.getKhutbahs(mosqueId, {
      ...filter,
      search: searchQuery
    })
  );

  React.useEffect(() => {
    void fetchKhutbahs();
  }, [filter, searchQuery]);

  const handleDownloadTranscript = async (khutbahId: string) => {
    try {
      const response = await khateebService.downloadTranscript(khutbahId);
      console.log(response);
      toast({
        title: t('smartKhateeb.messages.downloadSuccess'),
        variant: 'default'
      });
      // Implement download logic here
    } catch (error) {
      console.log(error);
      toast({
        title: t('smartKhateeb.messages.downloadError'),
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: KhutbahRecording['status']) => {
    const variants = {
      processing: 'warning',
      completed: 'success',
      failed: 'destructive'
    };

    return (
      <Badge className="text-nowrap" variant={variants[status] as BadgeProps['variant']}>
        {t(`smartKhateeb.status.${status}`)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <KhutbahDialog 
        khutbah={selectedKhutbah} 
        onClose={() => setSelectedKhutbah(null)} 
      />
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {t('smartKhateeb.title')}
          </h2>
        </div>
        <p className="text-muted-foreground">
          {t('smartKhateeb.description')}
        </p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('smartKhateeb.filters.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filter.status}
          onValueChange={(value) => 
            setFilter(prev => ({ ...prev, status: value as KhutbahRecording['status'] }))
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('smartKhateeb.filters.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="processing">{t('smartKhateeb.status.processing')}</SelectItem>
            <SelectItem value="completed">{t('smartKhateeb.status.completed')}</SelectItem>
            <SelectItem value="failed">{t('smartKhateeb.status.failed')}</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-4">
          <DatePicker
            date={filter.start_date}
            setDate={(date) => setFilter(prev => ({ ...prev, start_date: date }))}
            placeHolder={t('common.startDate')}
          />
          <DatePicker
            date={filter.end_date}
            setDate={(date) => setFilter(prev => ({ ...prev, end_date: date }))}
            placeHolder={t('common.endDate')}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('smartKhateeb.table.title')}</TableHead>
              <TableHead>{t('smartKhateeb.table.date')}</TableHead>
              <TableHead>{t('smartKhateeb.table.duration')}</TableHead>
              <TableHead>{t('smartKhateeb.table.khateeb')}</TableHead>
              <TableHead>{t('smartKhateeb.table.status')}</TableHead>
              <TableHead className="text-right">{t('smartKhateeb.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {khutbahsData?.data.map((khutbah) => (
              <TableRow key={khutbah.id}>
                <TableCell className="font-medium">{khutbah.title}</TableCell>
                <TableCell>
                  {new Date(khutbah.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                </TableCell>
                <TableCell>{formatDuration(khutbah.duration)}</TableCell>
                <TableCell>{khutbah.khateeb_name}</TableCell>
                <TableCell>{getStatusBadge(khutbah.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setSelectedKhutbah(khutbah)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={khutbah.status !== 'completed'}
                      onClick={() => handleDownloadTranscript(khutbah.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setSelectedKhutbah(khutbah)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 