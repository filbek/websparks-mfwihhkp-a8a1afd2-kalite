import React from 'react';
import { Card, CardContent } from '../components/ui/Card';

interface UnderConstructionProps {
  title: string;
  description?: string;
}

export const UnderConstruction: React.FC<UnderConstructionProps> = ({
  title,
  description = 'Bu sayfa şu anda geliştirilme aşamasındadır. En kısa sürede hizmetinizde olacaktır.'
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">{title}</h1>
        <p className="text-secondary-600 mt-2">Yapım Aşamasında</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="w-32 h-32 bg-warning-100 rounded-full flex items-center justify-center">
            <i className="bi bi-tools text-6xl text-warning-600"></i>
          </div>

          <div className="text-center max-w-md space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">
              Yapım Aşamasında
            </h2>
            <p className="text-secondary-600 leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex items-center space-x-2 text-sm text-secondary-500 mt-4">
            <i className="bi bi-clock-history"></i>
            <span>Çok yakında...</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <i className="bi bi-lightning-charge text-3xl text-primary-600 mb-3"></i>
            <h3 className="font-semibold text-secondary-900 mb-2">Hızlı Geliştirme</h3>
            <p className="text-sm text-secondary-600">
              Ekibimiz bu özelliği sizler için hızla geliştiriyor
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <i className="bi bi-shield-check text-3xl text-success-600 mb-3"></i>
            <h3 className="font-semibold text-secondary-900 mb-2">Güvenli</h3>
            <p className="text-sm text-secondary-600">
              Tüm özellikler güvenlik standartlarına uygun şekilde hazırlanıyor
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <i className="bi bi-star text-3xl text-warning-500 mb-3"></i>
            <h3 className="font-semibold text-secondary-900 mb-2">Kaliteli</h3>
            <p className="text-sm text-secondary-600">
              En iyi kullanıcı deneyimi için titizlikle çalışıyoruz
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
