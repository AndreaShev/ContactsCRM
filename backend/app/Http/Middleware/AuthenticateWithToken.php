<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AuthenticateWithToken
{
    /**
     * Обрабатывает входящий запрос API
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Получаем токен из .env
        $validToken = env('API_TOKEN', 'secret_token');
        
        // Проверяем заголовок Authorization
        $authHeader = $request->header('Authorization');
        
        // Формат должен быть: Bearer ваш_токен
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json([
                'error' => 'Authorization header missing or invalid'
            ], 401);
        }
        
        // Извлекаем токен из заголовка
        $token = substr($authHeader, 7);
        
        // Сравниваем токены
        if ($token !== $validToken) {
            return response()->json([
                'error' => 'Invalid API token'
            ], 401);
        }
        
        // Если токен верный - пропускаем запрос дальше
        return $next($request);
    }
}