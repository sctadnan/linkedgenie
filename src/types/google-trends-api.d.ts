declare module 'google-trends-api' {
    interface DailyTrendsOptions {
        trendDate?: Date;
        geo?: string;
        hl?: string;
        timezone?: number;
        ns?: number;
    }

    function dailyTrends(options: DailyTrendsOptions): Promise<string>;
    function realTimeTrends(options: DailyTrendsOptions): Promise<string>;
    function interestOverTime(options: DailyTrendsOptions): Promise<string>;

    const api: {
        dailyTrends: typeof dailyTrends;
        realTimeTrends: typeof realTimeTrends;
        interestOverTime: typeof interestOverTime;
    };

    export = api;
}
