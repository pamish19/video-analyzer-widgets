import { TimeLineComponent } from '.';
import { AvaDesignSystemProvider } from '../../../styles';
import { ITimeLineConfig } from './time-line.definitions';
interface ITemplate {
    darkTheme?: boolean;
    date?: Date;
    enableZoom?: boolean;
}

// Prevent tree-shaking
TimeLineComponent;
AvaDesignSystemProvider;

const segments = [
    { startSeconds: 0, endSeconds: 3600 },
    { startSeconds: 4500, endSeconds: 5000, color: 'red' },
    { startSeconds: 20000, endSeconds: 30000 },
    { startSeconds: 55000, endSeconds: 57000 },
    { startSeconds: 60600, endSeconds: 64200 },
    { startSeconds: 80000, endSeconds: 81000, color: 'blue' }
];

const config: ITimeLineConfig = {
    segments: segments,
    date: new Date()
};

const TimeLineComponentTemplate = (data: ITemplate) => {
    const designSystem = document.createElement('ava-design-system-provider') as AvaDesignSystemProvider;
    const timeLine = document.createElement('media-time-line') as TimeLineComponent;

    if (data.darkTheme) {
        designSystem.theme = 'dark';
    } else {
        designSystem.theme = '';
    }

    if (data.date) {
        const date = new Date(data.date);
        config.date = date;
    }

    config.enableZoom = data.enableZoom;

    timeLine.config = config;
    designSystem.appendChild(timeLine);
    return designSystem;
};

export const TimeLine = (args: ITemplate) => TimeLineComponentTemplate(args);

export default {
    title: 'Time Line Component',
    argTypes: {
        darkTheme: { control: 'boolean', defaultValue: true },
        enableZoom: { control: 'boolean', defaultValue: false },
        date: { control: 'date' }
    }
};
