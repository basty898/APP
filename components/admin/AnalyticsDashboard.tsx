// FIX: Import useMemo to resolve 'Cannot find name' errors.
import React, { useState, useRef, useMemo } from 'react';
import { CATEGORY_STYLES } from '../../constants';
import CategoryChart from '../CategoryChart';
import { Users, CreditCard, BarChart, XCircle, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAnalytics } from '../../hooks/useAnalytics'; // Custom hook for logic


const KPICard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: React.ElementType, color: string }) => (
    <div className="bg-white p-6 rounded-2xl shadow-md flex items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${color}`}>
            <Icon className="text-white" size={24} />
        </div>
        <div>
            <p className="text-sm text-text-secondary font-medium">{title}</p>
            <p className="text-2xl font-bold text-text-primary">{value}</p>
        </div>
    </div>
);

const KPICardSkeleton = () => (
    <div className="bg-white p-6 rounded-2xl shadow-md flex items-center animate-pulse">
        <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
        <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-7 bg-gray-400 rounded w-1/2"></div>
        </div>
    </div>
);

const ChartSkeleton = () => (
    <div className="bg-white p-6 rounded-2xl shadow-md animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
        <div className="h-80 bg-gray-200 rounded-lg"></div>
    </div>
);


const AnalyticsDashboard: React.FC = () => {
    const { isLoading, kpis, platformData, categoryData } = useAnalytics();

    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);
    
    const handleExportPDF = async () => {
        if (!reportRef.current) return;
        setIsGeneratingPDF(true);
    
        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                backgroundColor: '#EBF6F3'
            });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });
    
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
            pdf.setFontSize(20);
            pdf.text('Reporte de Analíticas - ZenSub', 10, 20);
            pdf.setFontSize(12);
            pdf.text(`Generado el: ${new Date().toLocaleDateString('es-CL')}`, 10, 28);
    
            pdf.addImage(imgData, 'PNG', 0, 40, pdfWidth, imgHeight);
            
            pdf.save(`ZenSub_Reporte_Global_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Hubo un error al generar el PDF.");
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const exportDataToCSV = (data: any[], filename: string, headers: string[]) => {
        const rows = data.map(item => 
            headers.map(header => {
                const key = header.toLowerCase().replace(/ /g, '_');
                let value = item[key] ?? item[header] ?? item[Object.keys(item).find(k => k.toLowerCase() === header.toLowerCase())];
                if (typeof value === 'number' && key === 'porcentaje') {
                    value = `${(value * 100).toFixed(2)}%`;
                }
                 if (typeof value === 'number' && key === 'crecimiento') {
                    value = `${value.toFixed(2)}%`;
                }
                return `"${value}"`;
            }).join(',')
        );

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const categoryColors = useMemo(() => categoryData.map(entry => {
        const categoryKey = entry.name as keyof typeof CATEGORY_STYLES;
        return CATEGORY_STYLES[categoryKey]?.chartColor || '#cccccc';
    }), [categoryData]);
    
    const platformColors = useMemo(() => {
      const colors = ['#8B5CF6', '#24CCA7', '#FFA775', '#5282FF', '#EF4444', '#FBBF24', '#64748B'];
      return platformData.map((_, index) => colors[index % colors.length]);
    }, [platformData]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <KPICardSkeleton />
                        <KPICardSkeleton />
                        <KPICardSkeleton />
                        <KPICardSkeleton />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ChartSkeleton />
                        <ChartSkeleton />
                    </div>
                </>
            );
        }

        return (
            <>
                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <KPICard title="Usuarios Activos" value={kpis.activeUsers} icon={Users} color="bg-brand-blue" />
                    <KPICard title="Suscripciones Activas" value={kpis.activeSubscriptions} icon={CreditCard} color="bg-brand-green" />
                    <KPICard title="Ticket Promedio Mensual" value={new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(kpis.averageMonthlyValue)} icon={BarChart} color="bg-brand-orange" />
                    <KPICard title="Tasa de Cancelación (Hist.)" value={`${kpis.churnRate.toFixed(1)}%`} icon={XCircle} color="bg-brand-red" />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-text-primary">Uso por Plataforma</h3>
                            <button onClick={() => exportDataToCSV(platformData, `reporte_plataformas_global.csv`, ['Plataforma', 'Suscripciones', 'Porcentaje'])} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors" title="Exportar datos a CSV">
                                <Download size={14} /> CSV
                            </button>
                        </div>
                        <div className="h-80">
                             <CategoryChart data={platformData} colors={platformColors} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-text-primary">Uso por Categoría</h3>
                            <button onClick={() => exportDataToCSV(categoryData, `reporte_categorias_global.csv`, ['Categoria', 'Suscripciones', 'Porcentaje'])} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors" title="Exportar datos a CSV">
                                <Download size={14} /> CSV
                            </button>
                        </div>
                         <div className="h-80">
                             <CategoryChart data={categoryData} colors={categoryColors} />
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <div>
            <header className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Gráficos de Analíticas</h1>
                    <p className="text-text-secondary mt-1">Métricas clave sobre la actividad en la plataforma (datos históricos).</p>
                </div>
                 <button
                    onClick={handleExportPDF}
                    disabled={isGeneratingPDF || isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400"
                >
                    <FileText size={18} />
                    {isGeneratingPDF ? 'Generando...' : 'Exportar PDF'}
                </button>
            </header>

            <div ref={reportRef}>
              {renderContent()}
            </div>
        </div>
    );
};

export default AnalyticsDashboard;