<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Area;
use App\Models\UserAreaResponsibility;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MOManageAccountController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // Get all users including MO and CCH
        $users = User::with(['area', 'areaResponsibilities.area'])
            ->orderByRaw("CASE 
                WHEN role = 'MO' THEN 1 
                WHEN role = 'CCH' THEN 2 
                WHEN role = 'AMO Region' THEN 3 
                WHEN role = 'AMO Area' THEN 4 
                ELSE 5 
            END")
            ->orderBy('nama')
            ->get()
            ->map(function ($user) {
                // Get areas for AMO Region from UserAreaResponsibility
                $areas = [];
                if ($user->role === 'AMO Region') {
                    $areas = $user->areaResponsibilities->map(function ($resp) {
                        return $resp->area ? $resp->area->nama : null;
                    })->filter()->toArray();
                } elseif ($user->area) {
                    $areas = [$user->area->nama];
                }
                
                return [
                    'id' => $user->id,
                    'nama' => $user->nama,
                    'email' => $user->email,
                    'password' => '••••••••', // Hidden password display
                    'role' => $user->role,
                    'area_id' => $user->area_id,
                    'areas' => $areas,
                    'area_names' => implode(', ', $areas),
                ];
            });
        
        // Get all areas for dropdown, excluding "Region"
        $areas = Area::select('id', 'nama')
            ->where('nama', '!=', 'Region')
            ->get();
        
        return Inertia::render("MO/Manage Account/page", [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'nama' => $user->nama,
                    'email' => $user->email,
                    'role' => $user->role,
                    'area' => $user->area ? [
                        'id' => $user->area->id,
                        'name' => $user->area->nama,
                    ] : null,
                ]
            ],
            'users' => $users,
            'areas' => $areas,
        ]);
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:AMO Area,AMO Region,MO,CCH',
            'area_id' => 'required_if:role,AMO Area|nullable|exists:areas,id',
            'area_ids' => 'required_if:role,AMO Region|array|min:1',
            'area_ids.*' => 'exists:areas,id',
        ], [
            'email.unique' => 'Email sudah terpakai',
        ]);
        
        DB::beginTransaction();
        try {
            // Create user
            $user = User::create([
                'nama' => $request->nama,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'area_id' => $request->role === 'AMO Area' ? $request->area_id : null,
            ]);
            
            // If AMO Region, create area responsibilities
            if ($request->role === 'AMO Region' && $request->has('area_ids')) {
                foreach ($request->area_ids as $areaId) {
                    UserAreaResponsibility::create([
                        'supervisor_id' => $user->id,
                        'area_id' => $areaId,
                    ]);
                }
            }
            
            DB::commit();
            
            return redirect()->back()->with('success', 'User created successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to create user: ' . $e->getMessage());
        }
    }
    
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'nama' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'role' => 'required|in:AMO Area,AMO Region,MO,CCH',
            'area_id' => 'required_if:role,AMO Area|nullable|exists:areas,id',
            'area_ids' => 'required_if:role,AMO Region|array|min:1',
            'area_ids.*' => 'exists:areas,id',
        ], [
            'email.unique' => 'Email sudah terpakai',
        ]);
        
        DB::beginTransaction();
        try {
            // Update user
            $updateData = [
                'nama' => $request->nama,
                'email' => $request->email,
                'role' => $request->role,
            ];
            
            // Only update area_id for AMO Area
            if ($request->role === 'AMO Area') {
                $updateData['area_id'] = $request->area_id;
            } elseif (!in_array($request->role, ['MO', 'CCH'])) {
                // Clear area_id for AMO Region and other roles (except MO and CCH which don't have area)
                $updateData['area_id'] = null;
            }
            // For MO and CCH, don't update area_id (they don't have area)
            
            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }
            
            $user->update($updateData);
            
            // Update area responsibilities for AMO Region
            if ($request->role === 'AMO Region') {
                // Delete existing responsibilities
                UserAreaResponsibility::where('supervisor_id', $user->id)->delete();
                
                // Create new responsibilities
                if ($request->has('area_ids')) {
                    foreach ($request->area_ids as $areaId) {
                        UserAreaResponsibility::create([
                            'supervisor_id' => $user->id,
                            'area_id' => $areaId,
                        ]);
                    }
                }
            } else {
                // Delete responsibilities if role changed from AMO Region
                UserAreaResponsibility::where('supervisor_id', $user->id)->delete();
            }
            
            DB::commit();
            
            return redirect()->back()->with('success', 'User updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to update user: ' . $e->getMessage());
        }
    }
    
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Prevent deleting MO or CCH users
        if (in_array($user->role, ['MO', 'CCH'])) {
            return redirect()->back()->with('error', 'Cannot delete MO or CCH users');
        }
        
        DB::beginTransaction();
        try {
            // Delete area responsibilities
            UserAreaResponsibility::where('supervisor_id', $user->id)->delete();
            
            // Delete user
            $user->delete();
            
            DB::commit();
            
            return redirect()->back()->with('success', 'User deleted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to delete user: ' . $e->getMessage());
        }
    }
}