
/**
 * Simple dependency-free CLI progress bar
 */
export class ProgressBar {
    private total: number;
    private current: number = 0;
    private width: number = 40;
    private label: string;
    private startTime: number;

    constructor(total: number, label: string = 'Progress') {
        this.total = total;
        this.label = label;
        this.startTime = Date.now();
    }

    update(current: number, extraInfo: string = '') {
        this.current = current;
        const percentage = Math.min(Math.max((this.current / this.total) * 100, 0), 100);
        const completedWidth = Math.round((this.width * percentage) / 100);
        const remainingWidth = this.width - completedWidth;

        const bar = '='.repeat(completedWidth) + ' '.repeat(remainingWidth);
        const elapsed = (Date.now() - this.startTime) / 1000;
        const rate = this.current / elapsed;
        const remaining = rate > 0 ? (this.total - this.current) / rate : 0;

        const timeInfo = `| ${elapsed.toFixed(1)}s elapsed | ~${remaining.toFixed(1)}s remaining`;
        const progressInfo = `${this.current}/${this.total} (${percentage.toFixed(1)}%)`;

        process.stdout.write(`\r${this.label}: [${bar}] ${progressInfo} ${timeInfo} ${extraInfo ? '| ' + extraInfo : ''}`);
    }

    finish(finalMessage: string = 'Done!') {
        const elapsed = (Date.now() - this.startTime) / 1000;
        process.stdout.write(`\n✅ ${this.label} completed in ${elapsed.toFixed(1)}s. ${finalMessage}\n`);
    }
}
