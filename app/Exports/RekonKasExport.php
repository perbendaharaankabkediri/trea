<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

class RekonKasExport implements FromView, ShouldAutoSize, WithEvents
{
    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function view(): View
    {
        return view('icsa.excel', $this->data);
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // --- Wrap text di seluruh sheet ---
                $sheet->getStyle('A1:C200')->getAlignment()
                    ->setWrapText(true);

                // --- Kolom A lebih lebar (label), C lebih lebar (nilai) ---
                $sheet->getColumnDimension('A')->setAutoSize(false)->setWidth(45);
                $sheet->getColumnDimension('B')->setAutoSize(false)->setWidth(3);
                $sheet->getColumnDimension('C')->setAutoSize(false)->setWidth(20);

                // --- Setup halaman untuk cetak (F4 / Ctrl+P) ---
                $sheet->getPageSetup()
                    ->setOrientation(PageSetup::ORIENTATION_PORTRAIT)
                    ->setPaperSize(PageSetup::PAPERSIZE_A4)
                    ->setFitToPage(true)
                    ->setFitToWidth(1)
                    ->setFitToHeight(0); // 0 = auto banyak halaman

                // --- Margin cetak (dalam inci) ---
                $sheet->getPageMargins()
                    ->setTop(0.75)
                    ->setBottom(0.75)
                    ->setLeft(0.7)
                    ->setRight(0.7);

                // --- Print area otomatis sesuai data ---
                $highestRow = $sheet->getHighestRow();
                $sheet->getPageSetup()->setPrintArea("A1:C{$highestRow}");

                // --- Gridlines tidak dicetak ---
                $sheet->setShowGridlines(false);
                $sheet->setPrintGridlines(false);
            },
        ];
    }
}