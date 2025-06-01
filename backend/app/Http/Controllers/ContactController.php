<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    /**
     * Отображает список контактов с возможностью фильтрации по тегам
     */
    public function index(Request $request)
    {
        // Создаем базовый запрос
        $query = Contact::query();
        
        // Фильтрация по тегу, если параметр передан
        if ($request->has('tag')) {
            $query->whereJsonContains('tags', $request->tag);
        }
        
        // Возвращаем результаты в формате JSON
        return $query->get();
    }

    /**
     * Создает новый контакт
     */
    public function store(Request $request)
    {
        // Валидация данных
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:contacts,email',
            'phone' => 'nullable|string|max:20',
            'tags' => 'nullable|array',
            'comment' => 'nullable|string'
        ]);
        
        // Создаем контакт
        $contact = Contact::create($data);
        
        // Отправляем уведомление в Telegram (псевдо-реализация)
        $this->sendTelegramNotification($contact);
        
        // Возвращаем созданный контакт с кодом 201
        return response()->json($contact, 201);
    }

    /**
     * Отображает конкретный контакт
     */
    public function show(Contact $contact)
    {
        return $contact;
    }

    /**
     * Обновляет существующий контакт
     */
    public function update(Request $request, Contact $contact)
    {
        // Валидация данных (email должен быть уникальным, исключая текущий контакт)
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:contacts,email,'.$contact->id,
            'phone' => 'nullable|string|max:20',
            'tags' => 'nullable|array',
            'comment' => 'nullable|string'
        ]);
        
        // Обновляем контакт
        $contact->update($data);
        
        // Возвращаем обновленный контакт
        return $contact;
    }

    /**
     * Удаляет контакт
     */
    public function destroy(Contact $contact)
    {
        $contact->delete();
        return response()->noContent(); // Код 204 - No Content
    }

    /**
     * Отправляет уведомление в Telegram (псевдо-реализация)
     */
    private function sendTelegramNotification(Contact $contact)
    {
        // Формируем сообщение
        $message = "📬 Новый контакт!\n"
            . "Имя: {$contact->name}\n"
            . "Email: {$contact->email}\n"
            . "Телефон: " . ($contact->phone ?? 'не указан') . "\n"
            . "Теги: " . (implode(', ', $contact->tags) ?? 'нет');
        
        // В реальной реализации здесь будет отправка в Telegram
        // Для демонстрации просто логируем сообщение
        
        Log::info("Telegram notification would be sent: \n" . $message);
        
        /*
        // РЕАЛЬНАЯ РЕАЛИЗАЦИЯ (раскомментировать после настройки .env)
        $token = env('TELEGRAM_BOT_TOKEN');
        $chatId = env('TELEGRAM_CHAT_ID');
        
        if ($token && $chatId) {
            $url = "https://api.telegram.org/bot{$token}/sendMessage";
            
            $response = Http::post($url, [
                'chat_id' => $chatId,
                'text' => $message
            ]);
        }
        */
    }
}