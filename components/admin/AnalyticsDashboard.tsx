import React, { useRef } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Users, Wallet, TrendingUp, TrendingDown, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { CATEGORY_STYLES } from '../../constants';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const KPICard: React.FC<{ title: string; value: string; icon: React.ElementType, color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="text-white" size={24} />
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const ChartCard: React.FC<{ title: string; data: any[]; colors: string[] }> = ({ title, data, colors }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
        {data.length > 0 ? (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [`${value} suscripciones`, name]} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
        ) : <p className="text-center text-gray-500 h-[300px] flex items-center justify-center">No hay datos suficientes.</p>}
    </div>
);


const AnalyticsDashboard: React.FC = () => {
    const { kpis, platformData, categoryData, isLoading } = useAnalytics();
    const dashboardRef = useRef<HTMLDivElement>(null);

    const platformColors = ['#24CCA7', '#8B5CF6', '#FFA775', '#5282FF', '#EF4444', '#FFD166', '#B0B8C4'];
    const categoryColors = Object.values(CATEGORY_STYLES).map(s => s.chartColor);

    const exportToPDF = () => {
        if (!dashboardRef.current) return;
        html2canvas(dashboardRef.current).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('analytics-dashboard.pdf');
        });
    };

    const exportToCSV = () => {
        const headers = "type,name,count,percentage\n";
        
        const platformRows = platformData.map(d => `platform,"${d.name}",${d.value},${(d.percent * 100).toFixed(2)}%`).join("\n");
        const categoryRows = categoryData.map(d => `category,"${d.name}",${d.value},${(d.percent * 100).toFixed(2)}%`).join("\n");
        
        const csvContent = "data:text/csv;charset=utf-8," + headers + platformRows + "\n" + categoryRows;
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "analytics_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return <div className="text-center p-10">Cargando datos de analíticas...</div>;
    }

    return (
        <div>
            <div className="flex justify-end gap-2 mb-4">
                 <button onClick={exportToPDF} className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">
                    <FileText size={16}/> Exportar a PDF
                </button>
                <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <FileSpreadsheet size={16}/> Exportar a CSV
                </button>
            </div>
            <div ref={dashboardRef} className="p-4 bg-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <KPICard title="Usuarios Activos" value={kpis.activeUsers.toString()} icon={Users} color="bg-blue-500" />
                    <KPICard title="Suscripciones Activas" value={kpis.activeSubscriptions.toString()} icon={Wallet} color="bg-green-500" />
                    <KPICard title="Valor Mensual Promedio" value={new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(kpis.averageMonthlyValue)} icon={TrendingUp} color="bg-yellow-500" />
                    <KPICard title="Tasa de Abandono (Churn)" value={`${kpis.churnRate.toFixed(2)}%`} icon={TrendingDown} color="bg-red-500" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ChartCard title="Distribución por Plataforma" data={platformData.slice(0, 7)} colors={platformColors} />
                    <ChartCard title="Distribución por Categoría" data={categoryData.slice(0, 7)} colors={categoryColors} />
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
