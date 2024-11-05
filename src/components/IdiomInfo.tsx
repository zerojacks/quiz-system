import { useNavigate, useParams } from 'react-router-dom';
import { getIdiomApi } from '../api/idiomApi';
import IdiomDisplay from './IdiomDisplay';
import { useEffect, useState } from 'react';
import { Idiom } from '../types/idiom';
import { ArrowLeft } from 'lucide-react';

const getIdiom = async (idiomId: string): Promise<Idiom> => {
    try {
        const idiom = await getIdiomApi(idiomId);
        if(!idiom) {
            return {
                idiom: '',
                description: '',
                major_type_code: '',
                minor_type_code: '',
                examples: [],
                examImages: []
            };
        }
        return idiom;
    } catch (err) {
        console.error('Error fetching idiom:', err);
        return {
            idiom: '',
            description: '',
            major_type_code: '',
            minor_type_code: '',
            examples: [],
            examImages: []
        };
    }
};

export const IdiomInfo: React.FC = () => {
    const { idiomId } = useParams<{ idiomId: string }>();
    const [selectedIdiom, setSelectedIdiom] = useState<Idiom | null>(null);
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchIdiom = async () => {
            if (idiomId) {
                const idiom = await getIdiom(idiomId);
                setSelectedIdiom(idiom);
            }
        };
        console.log("id", idiomId);
        fetchIdiom();
    }, [idiomId]);

    const handleUpdateIdiom = (updatedIdiom: Idiom) => {
        setSelectedIdiom(updatedIdiom);
    };

    const handleGoBack = () => {
        navigate(-1);
    };
    
    if (!selectedIdiom) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4">
            <div className="flex items-center mb-4">
                <ArrowLeft
                    className="cursor-pointer"
                    size={24}
                    onClick={handleGoBack}
                />
                <span className="ml-2">返回</span>
            </div>
            <IdiomDisplay
                idiom={selectedIdiom}
                onUpdate={handleUpdateIdiom}
            />
        </div>
    );
};