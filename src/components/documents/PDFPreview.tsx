import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  onDownload: () => void;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  onDownload
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const goToPreviousPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={fileName} size="xl">
      <div className="flex flex-col h-[80vh]">
        <div className="flex items-center justify-between bg-secondary-50 p-4 rounded-t-lg border-b border-secondary-200">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={pageNumber <= 1}
              className="text-secondary-700"
            >
              <i className="bi bi-chevron-left"></i>
            </Button>
            <span className="text-sm text-secondary-700 min-w-[100px] text-center">
              Sayfa {pageNumber} / {numPages || '...'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={pageNumber >= (numPages || 1)}
              className="text-secondary-700"
            >
              <i className="bi bi-chevron-right"></i>
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="text-secondary-700"
            >
              <i className="bi bi-zoom-out"></i>
            </Button>
            <span className="text-sm text-secondary-700 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              disabled={scale >= 2.0}
              className="text-secondary-700"
            >
              <i className="bi bi-zoom-in"></i>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetZoom}
              className="text-secondary-700"
            >
              <i className="bi bi-arrows-angle-contract"></i>
            </Button>
          </div>

          <Button
            onClick={onDownload}
            className="bg-primary-600 hover:bg-primary-700"
            size="sm"
          >
            <i className="bi bi-download mr-2"></i>
            İndir
          </Button>
        </div>

        <div className="flex-1 overflow-auto bg-secondary-100 p-4">
          <div className="flex justify-center">
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              }
              error={
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="bi bi-exclamation-triangle text-4xl text-danger-600"></i>
                  </div>
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">
                    PDF Yüklenemedi
                  </h3>
                  <p className="text-secondary-600">
                    PDF dosyası yüklenirken bir hata oluştu.
                  </p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                className="shadow-lg"
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
          </div>
        </div>
      </div>
    </Modal>
  );
};
